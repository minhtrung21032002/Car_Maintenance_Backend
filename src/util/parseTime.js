// Function to parse date and time to Vietnam Standard Time (VST)
function parseDateTimeToVST(dateString, timeString) {
    // Parse date and time strings into Date objects
    const date = new Date(dateString);
    const time = new Date(timeString);

    // Calculate Vietnam Standard Time offset (UTC+7)
    const vstOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds

    // Calculate Vietnam Standard Time for the given date and time
    const vstDateTime = new Date(date.getTime() + vstOffset);
    const vstDateTime2 = new Date(date.getTime() + time.getTime() + vstOffset);
    // Format date and time st  rings
    const formattedDate = vstDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    const formattedTime = vstDateTime2.toLocaleTimeString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });

    // Return formatted result
    return { date: formattedDate, time: formattedTime };
}

// Export the function
module.exports = parseDateTimeToVST;
