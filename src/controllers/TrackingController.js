const User = require('../models/user');
const Service = require('../models/service');
const Refuelling = require('../models/refuelling');
const Reminder = require('../models/reminder');
const Service_type = require('../models/service_type');
const Gas_station = require('../models/gas_stations')
const Place = require('../models/place')
const Fuel = require('../models/fuel')
const Fuel_object = require('../models/fuel_object')
const Vehicle = require('../models/vehicle')
const fs = require('fs');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const tls = require('tls');


const parseDateTimeToVST = require('../util/parseTime')
class TrackingController{


    // [GET] /api

    async tracking_page_history(req,res){
        const vehicle_id = req.params.vehicle_id;
        function parseDate(dateString) {
            const parts = dateString.split('/');
            const day = parseInt(parts[1], 10);
            const month = parseInt(parts[0], 10) - 1; // Months are 0-based in JavaScript Date object
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }

        function formatDate(date) {
            const day = date.getDate();
            const month = date.getMonth() + 1; // Months are 0-based, so we add 1
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }

        try {
            // Query Service records with the specified vehicle_id
            const SERVICE_HISTORY = await Service.find({ vehicle_id });
        
            // Map _id to service_id and format the data
            const SERVICE_HISTORY_DATA = SERVICE_HISTORY.map(service => ({
                SERVICE_ID: service._id,
                ODOMETER: `${service.odometer} km`,
                DATE: parseDate(service.date),
                PLACE: service.place,
                SERVICE_TYPE: service.service_type,
                TOTAL_PRICE: `đ${service.cost}`,
                COMMENTS: service.notes,
                FUEL_TYPE: service.fuel_type,
                TIME: service.time,
                COST: service.cost


                // Add other fields from the Service model as needed
            }));
        
            // Query Refuelling records with the specified vehicle_id and populate fuel_object
            const REFUELLING_HISTORY = await Refuelling.find({ vehicle_id }).populate({
                path: 'fuel_object',
                model: 'Fuel_object',
            });

        
            // Process and format Refuelling data
            const REFUELLING_HISTORY_DATA = REFUELLING_HISTORY.map(refuelling => {
                // Calculate total price
                let totalPrice = 0;
                refuelling.fuel_object.forEach(fuelObject => {
                    totalPrice += fuelObject.total_cost;
                });
        
                return {
                    REFUELLING_ID: refuelling._id,
                    DATE: parseDate(refuelling.date),
                    TIME: refuelling.time,
                    FUEL_OBJECT: refuelling.fuel_object, // Populated fuel_object array
                    ODOMETER: `${refuelling.odometer} km`,
                    GAS_STATION: refuelling.gas_station,
                    TOTAL_PRICE: `đ${totalPrice}`,
                    COMMENTS: refuelling.notes,
                    // Add other fields from the Refuelling model as needed
                };
            });
        
            // Combine Service and Refuelling data
            const combinedHistory = [...SERVICE_HISTORY_DATA, ...REFUELLING_HISTORY_DATA];
            
            // Sort the combined history by date
            combinedHistory.sort((a, b) => a.DATE - b.DATE);
            // const totalPriceAllEntries = combinedHistory.reduce((total, entry) => {
            //     // Extract total price from each entry and add it to the total
            //     const totalPrice = parseFloat(entry.TOTAL_PRICE.replace('đ', ''));
            //     return total + totalPrice;
            // }, 0);
            
            // Format the date and send the response
            const transformedHistory = combinedHistory.map(entry => ({
                ...entry,
                DATE: formatDate(entry.DATE),

            }));

            // const responseData = {
            //     transformedHistory,
            //     TOTAL_PRICE: totalPriceAllEntries
            // };
        
            res.status(200).json(transformedHistory);
        } catch (error) {
            // Handle error
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }        
    async tracking_page_data(req,res){
        const session_userId_query = req.session.user_id;
        const loginUserInformation = await User.findById(session_userId_query).lean();

        const responseData = {
            login_user: loginUserInformation,
        };
        console.log('response data for main_page')
        console.log(responseData)
        res.json(responseData);
    }

    async tracking_service_api(req,res){
        try {
            const GAS_STATION = await Gas_station.find();
            // Map _id to service_id
            const GAS_STATION_DATA = GAS_STATION.map(type => {
              return {
                GAS_STATION_ID: type._id,
                GAS_STATION_NAME: type.gas_station_name
                // Add other fields from the Service_type model as needed
              };
            });


            const serviceTypes = await Service_type.find();
            // Map _id to service_id
            const SERVICE_DATA = serviceTypes.map(type => {
              return {
                SERVICE_ID: type._id,
                SERVICE_TYPE: type.service_type_name
                // Add other fields from the Service_type model as needed
              };
            });

            const fuel = await Fuel.find();
            const FUEL_DATA = fuel.map(type => {
                return {
                  FUEL_ID: type._id,
                  FUEL_NAME: type.fuel_name,
                  // Add other fields from the Service_type model as needed
                };
              });

              const place = await Place.find();
              const PLACE_DATA = place.map(type => {
                  return {
                    PLACE_ID: type._id,
                    PLACE_NAME: type.place_address,
                    // Add other fields from the Service_type model as needed
                  };
                });

            const responseData = {
                SERVICE_DATA,
                PLACE_DATA,
                FUEL_DATA,
                GAS_STATION_DATA,
            }
            res.status(200).json(responseData);
          } catch (error) {
            // Handle error
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
          }
          
    }

    async tracking_page_fuel_type(req,res){

    try{
        console.log("reach fuel api")
        const fuel = await Fuel.find();
        const FUEL_DATA = fuel.map(type => {
            return {
              FUEL_ID: type._id,
              FUEL_NAME: type.fuel_name,
              // Add other fields from the Service_type model as needed
            };
          });


        
          const responseData = {
            FUEL_DATA
        }

        res.status(200).json(responseData);
    } catch (error) {
      // Handle error
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }

    }

    async create_fuel_type(req,res){

        try {
            console.log(req.body)
            const newFuel = new Fuel({
                fuel_name: req.body.FUEL_NAME
            });
            await newFuel.save()

            const FUEL_DATA = {
                FUEL_ID: newFuel._id,
                FUEL_NAME: newFuel.fuel_name,
                // Add other fields from the Fuel model as needed
            };
            
            const responseData = {
                FUEL_DATA
            };
            
            // Sending the response with the created Fuel data
            res.status(200).json(responseData);
        } catch (error) {
            console.error('Error update reviewers:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async delete_fuel_type(req, res) {
        try {
            const fuel_id = req.params.fuel_id;
            console.log(fuel_id);
            console.log("Reached delete_fuel_type");
            
            // Find the fuel by ID and delete it
            const deletedFuel = await Fuel.findByIdAndDelete(fuel_id);
            
            if (!deletedFuel) {
                // If no fuel was found with the given ID
                return res.status(404).json({ error: 'Fuel not found' });
            }
            
            // Responding with the details of the deleted fuel
            const responseData = {
                FUEL_ID: deletedFuel._id,
                FUEL_NAME: deletedFuel.fuel_name
                // Add other fields if needed
            };
            
            res.status(200).json(responseData);
        } catch (error) {
            console.error('Error deleting fuel type:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    

    async update_fuel_type(req, res) {
        try {
            const fuel_id = req.params.fuel_id;
            console.log(fuel_id);
            console.log("Reached update_fuel_type");
    
            const updateData = {
                fuel_name: req.body.FUEL_NAME
                // Add other fields from the Fuel model as needed
            };
    
            // Find the fuel type by ID and update it
            const updatedFuelType = await Fuel.findByIdAndUpdate(
                fuel_id,
                updateData,
                { new: true } // This option returns the modified document
            );
    
            if (!updatedFuelType) {
                // If no fuel type was found with the given ID
                return res.status(404).json({ error: 'Fuel type not found' });
            }
    
            // Responding with the details of the updated fuel type
            const FUEL_DATA = {
                FUEL_ID: updatedFuelType._id,
                FUEL_NAME: updatedFuelType.fuel_name
                // Add other fields if needed
            };

            const responseData ={
                FUEL_DATA
            }
    
            res.status(200).json(responseData);
        } catch (error) {
            console.error('Error updating fuel type:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    

    async tracking_page_place(req,res){
        try {
            const places = await Place.find();
            // Map _id to service_id
            const PLACE_DATA = places.map(type => {
              return {
                PLACE_ID: type._id,
                PLACE_NAME: type.place_name,
                PLACE_ADDRESS:type.place_address
                // Add other fields from the Service_type model as needed
              };
            });

            const responseData = {
                PLACE_DATA
            }
            res.status(200).json(responseData);
          } catch (error) {
            // Handle error
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
          }
    }

    async create_place(req,res){
        console.log("reach create_place")
        try {
    
            const newPlace = new Place({
                place_name: req.body.PLACE_NAME,
                place_address: req.body.PLACE_ADDRESS
            });
            await newPlace.save()

            const PLACE_DATA = {
                PLACE_ID: newPlace._id,
                PLACE_NAME: newPlace.place_name,
                PLACE_ADDRESS: newPlace.place_address
                // Add other fields from the Fuel model as needed
            };
            
            const responseData = {
                PLACE_DATA
            };
            
            // Sending the response with the created Fuel data
            res.status(200).json(responseData);
        } catch (error) {
            console.error('Error update reviewers:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async delete_place(req, res) {
        try {
            const place_id = req.params.place_id;
            console.log(place_id);
            console.log("Reached delete_place");
    
            // Find the place by ID and delete it
            const deletedPlace = await Place.findByIdAndDelete(place_id);
    
            if (!deletedPlace) {
                // If no place was found with the given ID
                return res.status(404).json({ error: 'Place not found' });
            }
    
            // Responding with the details of the deleted place
            const responseData = {
                PLACE_ID: deletedPlace._id,
                PLACE_NAME: deletedPlace.place_name,
                PLACE_ADDRESS: deletedPlace.place_address
                // Add other fields if needed
            };
    
            res.status(200).json(responseData);
        } catch (error) {
            console.error('Error deleting place:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async update_place(req, res) {
        try {
            const place_id = req.params.place_id;
            console.log(place_id);
            console.log("Reached update_place");
    
            const updateData = {
                place_name: req.body.PLACE_NAME,
                place_address: req.body.PLACE_ADDRESS
                // Add other fields from the Place model as needed
            };
    
            // Find the place by ID and update it
            const updatedPlace = await Place.findByIdAndUpdate(
                place_id,
                updateData,
                { new: true } // This option returns the modified document
            );
    
            if (!updatedPlace) {
                // If no place was found with the given ID
                return res.status(404).json({ error: 'Place not found' });
            }
    
            // Responding with the details of the updated place
            const PLACE_DATA = {
                PLACE_ID: updatedPlace._id,
                PLACE_NAME: updatedPlace.place_name,
                PLACE_ADDRESS: updatedPlace.place_address
                // Add other fields if needed
            };

            const responseData = {
                PLACE_DATA
            }
    
            res.status(200).json(responseData);
        } catch (error) {
            console.error('Error updating place:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    

    async tracking_page_service_type(req,res){
        try {
            const serviceTypes = await Service_type.find();
            // Map _id to service_id
            const SERVICE_DATA = serviceTypes.map(type => {
              return {
                SERVICE_ID: type._id,
                SERVICE_TYPE: type.service_type_name
                // Add other fields from the Service_type model as needed
              };
            });

            const responseData = {
                SERVICE_DATA
            }
            res.status(200).json(responseData);
          } catch (error) {
            // Handle error
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
          }
    }


    async create_service_type(req, res) {
        console.log("reach create service _type")
        try {
            console.log(req.body);
            
            // Creating a new Service_type object
            const newServiceType = new Service_type({
                service_type_name: req.body.SERVICE_TYPE
            });
            
            // Saving the new Service_type object to the database
            await newServiceType.save();
            
            // Creating the response data object
            const SERVICE_DATA = {
                SERVICE_ID: newServiceType._id,
                SERVICE_TYPE: newServiceType.service_type_name
                // Add other fields from the Service_type model as needed
            };
            
            const responseData = {
                SERVICE_DATA
            };
            
            // Sending the response with the created Service_type data
            res.status(200).json(responseData);
        } catch (error) {
            console.error('Error creating new service type:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    

    async delete_service_type(req, res) {
        try {
            const service_type_id = req.params.service_type_id;
            console.log(service_type_id);
            console.log("Reached delete_service_type");
    
            // Find the service type by ID and delete it
            const deletedServiceType = await Service_type.findByIdAndDelete(service_type_id);
    
            if (!deletedServiceType) {
                // If no service type was found with the given ID
                return res.status(404).json({ error: 'Service type not found' });
            }
    
            // Responding with the details of the deleted service type
            const responseData = {
                SERVICE_TYPE_ID: deletedServiceType._id,
                SERVICE_TYPE_NAME: deletedServiceType.service_type_name
                // Add other fields if needed
            };
    
            res.status(200).json(responseData);
        } catch (error) {
            console.error('Error deleting service type:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async update_service_type(req, res) {
        try {
            const service_type_id = req.params.service_type_id;
            console.log(service_type_id);
            console.log("Reached update_service_type");
    
            const updateData = {
                service_type_name: req.body.SERVICE_TYPE
                // Add other fields from the Service_type model as needed
            };
    
            // Find the service type by ID and update it
            const updatedServiceType = await Service_type.findByIdAndUpdate(
                service_type_id, 
                updateData, 
                { new: true } // This option returns the modified document
            );
    
            if (!updatedServiceType) {
                // If no service type was found with the given ID
                return res.status(404).json({ error: 'Service type not found' });
            }
    
            // Responding with the details of the updated service type
            const SERVICE_DATA = {
                SERVICE_ID: updatedServiceType._id,
                SERVICE_TYPE: updatedServiceType.service_type_name
                // Add other fields if needed
            };
            const responseData = {
                SERVICE_DATA
            }
    
            res.status(200).json(responseData);
        } catch (error) {
            console.error('Error updating service type:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    

    async tracking_refuelling_api(req,res){
        try {
            const gas_station = await Gas_station.find();
            const fuel = await Fuel.find();
            // Map _id to service_id
            const GAS_DATA = gas_station.map(type => {
                return {
                  GAS_STATION_ID: type._id,
                  GAS_STATION_NAME: type.service_type_name,
                  GAS_STATION_ADDRESS: type.gas_station_address
                  // Add other fields from the Service_type model as needed
                };
              });
            


            const FUEL_DATA = fuel.map(type => {
                return {
                  FUEL_ID: type._id,
                  FUEL_NAME: type.fuel_name,
                  // Add other fields from the Service_type model as needed
                };
              });

            const responseData = {
                GAS_DATA,
                FUEL_DATA
            }
            res.status(200).json(responseData);
          } catch (error) {
            // Handle error
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
          }
    }

    async tracking_reminder_api(req,res){
        const vehicle_id = req.params.vehicle_id;
        function parseDate(dateString) {
            const parts = dateString.split('/');
            const day = parseInt(parts[1], 10);
            const month = parseInt(parts[0], 10) - 1; // Months are 0-based in JavaScript Date object
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }

        function formatDate(date) {
            const day = date.getDate();
            const month = date.getMonth() + 1; // Months are 0-based, so we add 1
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }

        try {
            // Query Service records with the specified vehicle_id
            const REMINDER_HISTORY = await Reminder.find({ vehicle_id });
        
            // Map _id to service_id and format the data
            const REMINDER_HISTORY_DATA = REMINDER_HISTORY.map(reminder => ({
                REMINDER_ID: reminder._id,
                DATE: parseDate(reminder.date),
                REMINDER_TYPE: reminder.type_notification,
                ODOMETER: reminder.odometer,
                SERVICE_TYPE: reminder.service_type,
                TIME: reminder.time,
                COMMENTS: reminder.notes,
                // Add other fields from the Service model as needed
            }));
        
        
            REMINDER_HISTORY_DATA.sort((a, b) => a.DATE - b.DATE);
        
            // Format the date and send the response
            const transformedHistory = REMINDER_HISTORY_DATA.map(entry => ({
                ...entry,
                DATE: formatDate(entry.DATE)
            }));
        
            res.status(200).json(transformedHistory);
        } catch (error) {
            // Handle error
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async tracking_vehicle_api(req,res){
        try {

            console.log("reach vehicle api getting data")
            const vehicles = await Vehicle.find();
            const user_id = req.params.user_id;
            console.log("user_id equal")
            console.log(user_id)
            const VEHICLE_DATA = vehicles
                .filter(vehicle => vehicle.user_id === user_id) // Filter vehicles based on user_id
                .map(vehicle => ({
                    vehicle_id: vehicle._id,
                    type: vehicle.type,
                    manufacturer: vehicle.manufacturer,
                    model: vehicle.model,
                    name: vehicle.name,
                    last_updated: vehicle.last_updated,
                    status: vehicle.status
                }));
        
            const responseData = {
                VEHICLE_DATA
            };
        
            res.status(200).json(responseData);
        } catch (error) {
            // Handle any errors that occur during the database query or other asynchronous operations
            console.error("Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
        

    }

    async tracking_page_user(req,res){
        const userId = req.params.user_id;
        const loginUserInformation = await User.findById(userId).lean();

        const responseData = {
            login_user: loginUserInformation,
        };
        console.log('response data for main_page')
        console.log(responseData)
        res.json(responseData);
    }
    async tracking_page_service(req,res){
        const vehicleId = req.params.vehicle_id;
        
        const Service = new Service({
            vehicle_id:  vehicleId,
            date: req.body.date,
            time: req.body.time,
            odometer: req.body.odometer,
            service_id: req.body.service_id,
            cost: req.body.cost,
            notes: req.body.notes,
        });


        try {
            await Service.save();
            console.log('Service save')
        } catch (error) {
            console.error('Error saving Service:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json('Service Saved')

    }

    async tracking_page_refuelling(req,res){
        const vehicleId = req.params.vehicle_id;
        // date: { type: Date, default: Date.now },
        // time: Number,
        // odometer: Number,
        // fuel_id: [Schema.Types.ObjectId],
        // price_per_l: [Number],
        // litres: [Number],
        // total_cost: [Number],
        // gas_station: Schema.Types.ObjectId,
        // notes: String
        const Refuelling = new Refuelling({
            vehicle_id:  vehicleId,
            date: req.body.date,
            time: req.body.time,
            odometer: req.body.odometer,
            service_id: req.body.gas_station_id,
            cost: req.body.cost,
            notes: req.body.notes,
        });


        try {
            await Service.save();
            console.log('Service save')
        } catch (error) {
            console.error('Error saving Service:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json('Service Saved')

    }
    async tracking_page_refuelling(req,res){


    }

    // [POST]


    // For /service/api/:vehicle_id
    async tracking_service_submit_api(req, res) {
        try {

            // Your code for handling service tracking submit API logic here
            console.log(req.body)
            let { date, time } = parseDateTimeToVST(req.body.date, req.body.time);
            console.log(date)
            console.log(time)

            const service = new Service({
                vehicle_id:  req.params.vehicle_id,
                date: date,
                time: time,
                odometer: req.body.odometer,
                place: req.body.place,
                fuel_type: req.body.fuelType,
                service_type: req.body.serviceType,
                cost: req.body.cost,
                notes: req.body.comments,
            });
            await service.save();
            // Example response - you can modify this according to your requirements
            return res.status(200).json({ message: "Service tracking submit API method called successfully" });
        } catch (error) {
            console.error("Error in tracking_service_submit_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // For /refuelling/api/:vehicle_id
    async tracking_refuelling_submit_api(req, res) {
        try {
            // Your code for handling refuelling tracking submit API logic here

            let { date, time } = parseDateTimeToVST(req.body.date, req.body.time);
            console.log(date)
            console.log(time)
            const createdFuelObjectIds = [];
            console.log(req.body)
            // Create Fuel_object documents
            await Promise.all(req.body.fields.map(async (fieldData) => {
                try {
                    const newFuelObject = new Fuel_object({
                        fuel_type: fieldData.fuelType,
                        fuel_capacity: parseInt(fieldData.fuelCapacity), // Parse string to number
                        fuel_price: parseFloat(fieldData.fuelPrice), // Parse string to float
                        total_cost: parseInt(fieldData.fuelCapacity) * parseInt(fieldData.fuelPrice) // Calculate total cost
                    });
                    const savedFuelObject = await newFuelObject.save();
                    createdFuelObjectIds.push(savedFuelObject._id); // Push the ID to the array
                } catch (error) {
                    console.error("Error creating Fuel_object:", error);
                    throw error; // Throw the error to stop execution and trigger catch block
                }
            }));
            // Create Fuel_object documents
          
                const refuelling = new Refuelling(
                    {
                        vehicle_id:  req.params.vehicle_id,
                        date: date,
                        time: time,
                        odometer: req.body.odometer,
                        fuel_object: createdFuelObjectIds,
                        gas_station: req.body.gasStation,
                        notes: req.body.comments
                    }
                )
             
                await refuelling.save();

            
          
            // Example response - you can modify this according to your requirements
            return res.status(200).json({ message: "Refuelling tracking submit API method called successfully" });
        } catch (error) {
            console.error("Error in tracking_refuelling_submit_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // For /reminder/api
    async tracking_reminder_submit_api(req, res) {
        const user_id = req.body.userId
        const template = fs.readFileSync('src/resources/views/test.handlebars', 'utf8');
        const user = await User.findById(user_id); // query name field in that user
        const user_name = user.user_name;
        // Compile the template with Handlebars
        const compiledTemplate = handlebars.compile(template);
        let { date, time } = parseDateTimeToVST(req.body.date, req.body.time);
        const renderedTemplate = compiledTemplate({
            service_type: req.body.serviceType,
            name: user_name,
            date: date,
            time: time,
            odometer: req.body.odometer,
            comment: req.body.comments
        });
        console.log("reach reminder_submit")

        try {

            const reminder = new Reminder(
                {
                    vehicle_id:  req.params.vehicle_id,
                    odometer: req.body.odometer,
                    date: date,
                    time: time,
                    service_type: req.body.serviceType,
                    type_notification: req.body.contactMethod,
                    notes: req.body.comments,
                }
                
            );
            await reminder.save();
            // Your code for handling reminder tracking submit API logic here
            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'vuhoangminhtrung305@gmail.com', // your email address
                    pass: 'lebz oapt rsfy rtgt ' // your email password
                },
                tls: {
                    // Do not fail on invalid certs
                    rejectUnauthorized: false,
                    // Necessary only if the server uses a self-signed certificate
                    // To verify the self-signed certificate, you might need to set the `ca` option
                    // ca: [fs.readFileSync('path/to/ca.pem')],
                    // Alternatively, you can set the `secureContext` option with a custom `tls.createSecureContext` function
                    // secureContext: tls.createSecureContext({ ca: fs.readFileSync('path/to/ca.pem') })
                }
            });
            
            // Set up email data
            let mailOptions = {
                from: 'trung', // sender address
                to: 'vuhoangminhtrung305@gmail.com', // list of receivers
                subject: 'Test Email', // Subject line
                text: 'Hello world!', // plain text body
                html: renderedTemplate
            };
            
            // Send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
            });
            // Example response - you can modify this according to your requirements
            return res.status(200).json({ message: "Reminder tracking submit API method called successfully" });
        } catch (error) {
            console.error("Error in tracking_reminder_submit_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // For /createVehicle/api/:user_id
    async tracking_vehicle_submit_api(req, res) {
        try {
            let status

            if (req.body.active === 'active') {
                status = 'Active';
            } else if (req.body.active === 'inactive') {
                status = 'Deactive';
            } 
            const vehicle = new Vehicle(
                {
                    user_id: req.body.id,
                    manufacturer: req.body.manufacturer,
                    model: req.body.model,
                    name: req.body.name,
                    fuel_type: req.body.fuelType,
                    fuel_capacity: req.body.fuelCapacity,
                    odometer: req.body.odometer,
                    idenfication: req.body.idenfication,
                    license: req.body.license,
                    chassis: req.body.chassis,
                    notes: req.body.notes,
                    status: status
                }
                
            );
            await vehicle.save();
            // Your code for handling create vehicle tracking submit API logic here
            
            // Example response - you can modify this according to your requirements
            return res.status(200).json({ message: "Create vehicle tracking submit API method called successfully" });
        } catch (error) {
            console.error("Error in tracking_create_vehicle_submit_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    async tracking_vehicle_modal_submit_api(req, res) {
        try {
            console.log(req.body)
            const vehicle = new Vehicle(
                {
                    user_id: req.body.userId,
                    manufacturer: req.body.manufacturer,
                    model: req.body.model,
                    name: req.body.name,
                    type: req.body.carType
                }
                
            );
            await vehicle.save();
            // Your code for handling create vehicle tracking submit API logic here
            
            // Example response - you can modify this according to your requirements
            return res.status(200).json({message : "Create vehicle tracking modal submit API method called successfully" });
        } catch (error) {
            console.error("Error in tracking_create_vehicle_submit_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }



    // [DELETE]
    // For DELETE /service/api
    async tracking_service_delete_api(req, res) {
        console.log("reach service delete api")
        const service_id = req.params.service_id;
        console.log(service_id)
        try {
            // Check if the provided service_id is a valid ObjectId
            // Attempt to delete the service
            const deletedService = await Service.findByIdAndDelete(service_id);
    
            // Check if the service was found and deleted
         
    
            // Return success response
            return res.status(200).json({ message: "Service deleted successfully", deletedService });
        } catch (error) {
            console.error("Error in tracking_service_delete_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // For DELETE /refuelling/api
    async tracking_refuelling_delete_api(req, res) {
        console.log("reach refuelling delete")
        const refuelling_id = req.params.refuelling_id

        try {
        
            // Attempt to delete the service
            const deletedRefuelling = await Refuelling.findByIdAndDelete(refuelling_id);
            // Check if the service was found and deleted
           
            // Return success response
            return res.status(200).json({ message: "Refuelling deleted successfully", deletedRefuelling });
        } catch (error) {
            console.error("Error in tracking_refuelling_delete_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // For DELETE /reminder/api
    async tracking_reminder_delete_api(req, res) {
        console.log("reach reminder delete");
        const reminder_id = req.params.reminder_id;
        
        try {
            // Attempt to delete the reminder
            const deletedReminder = await Reminder.findByIdAndDelete(reminder_id);
            // Check if the reminder was found and deleted
            
            // Return success response
            return res.status(200).json({ message: "Reminder deleted successfully", deletedReminder });
        } catch (error) {
            console.error("Error in tracking_reminder_delete_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        
    }

    // For DELETE /vehicle/api
    async tracking_vehicle_delete_api(req, res) {
        console.log("reach vehicle delete")
        const vehicle_id = req.params.vehicle_id

        try {
        
            // Attempt to delete the service
            const deletedVehicle = await Vehicle.findByIdAndDelete(vehicle_id);
            // Check if the service was found and deleted
           
            // Return success response
            return res.status(200).json({ message: "Vehicle deleted successfully", deletedVehicle });
        } catch (error) {
            console.error("Error in tracking_Vehicle_delete_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    
    // [DELETE]
    // For PATCH /service/api
    async tracking_service_patch_api(req, res) {
        try {
            // Your code for handling service tracking patch API logic here
            
            // Example response - you can modify this according to your requirements
            return res.status(200).json({ message: "Service tracking patch API method called successfully" });
        } catch (error) {
            console.error("Error in tracking_service_patch_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // For PATCH /refuelling/api
    async tracking_refuelling_patch_api(req, res) {

        console.log("reach refuelling_patch")
        console.log(req.body)
        try {
            // Your code for handling refuelling tracking patch API logic here
            
            // Example response - you can modify this according to your requirements
            return res.status(200).json({ message: "Refuelling tracking patch API method called successfully" });
        } catch (error) {
            console.error("Error in tracking_refuelling_patch_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // For PATCH /reminder/api
    async tracking_reminder_patch_api(req, res) {
        console.log("reach reminder patch")
        console.log(req.body)
        try {
            // Your code for handling reminder tracking patch API logic here
            
            // Example response - you can modify this according to your requirements
            return res.status(200).json({ message: "Reminder tracking patch API method called successfully" });
        } catch (error) {
            console.error("Error in tracking_reminder_patch_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // For PATCH /vehicle/api
    async tracking_vehicle_patch_api(req, res) {
        try {
            // Your code for handling create vehicle tracking patch API logic here
            
            // Example response - you can modify this according to your requirements
            return res.status(200).json({ message: "Create vehicle tracking patch API method called successfully" });
        } catch (error) {
            console.error("Error in tracking_create_vehicle_patch_api:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }


}

module.exports = new TrackingController