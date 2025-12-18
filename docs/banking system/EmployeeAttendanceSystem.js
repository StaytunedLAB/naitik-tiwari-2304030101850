// Employee Attendance Processing System
// All operations inside try, all errors handled in catch, log in finally

function processAttendance(input) {
    let result = {
        employeeId: null,
        date: null,
        status: "error",
        totalWorkingMinutes: 0,
        overtimeMinutes: 0,
        note: "",
        errorMessage: ""
    };

    try {
        // Copy basic info safely (do not modify original input)
        result.employeeId = input.employeeId || "UNKNOWN";
        result.date = input.date || "UNKNOWN";

        // Validate check-in and check-out
        if (!input.checkIn || !input.checkOut) {
            result.status = "incomplete";
            result.totalWorkingMinutes = 0;
            result.note = "Check-in or check-out missing";
            return result;
        }

        // Convert time strings to Date objects
        const checkInTime = new Date(`1970-01-01T${input.checkIn}`);
        const checkOutTime = new Date(`1970-01-01T${input.checkOut}`);

        if (isNaN(checkInTime.getTime()) || isNaN(checkOutTime.getTime())) {
            throw new Error("Invalid time format");
        }

        let totalMinutes =
            (checkOutTime.getTime() - checkInTime.getTime()) / 60000;

        // Break handling
        if (input.break) {
            try {
                const breakStart = new Date(`1970-01-01T${input.break.start}`);
                let breakEnd;

                if (input.break.end) {
                    breakEnd = new Date(`1970-01-01T${input.break.end}`);
                    if (isNaN(breakEnd.getTime())) {
                        throw new Error("Invalid break end time");
                    }
                } else {
                    // Default 30-minute break
                    totalMinutes -= 30;
                    breakEnd = null;
                }

                if (!isNaN(breakStart.getTime()) && breakEnd) {
                    const breakMinutes =
                        (breakEnd.getTime() - breakStart.getTime()) / 60000;
                    totalMinutes -= breakMinutes;
                }
            } catch (breakError) {
                // If break data is corrupted, assume default break
                totalMinutes -= 30;
            }
        }

        // Negative working time check
        if (totalMinutes < 0) {
            result.status = "invalid";
            result.totalWorkingMinutes = 0;
            result.note = "Working time calculated as negative";
            return result;
        }

        // Normal complete case
        result.totalWorkingMinutes = Math.floor(totalMinutes);
        result.status = "complete";
        result.note = "Attendance processed normally";

        // Overtime calculation
        if (input.overtimeApproved === true && totalMinutes > 480) {
            result.overtimeMinutes = Math.floor(totalMinutes - 480);
        }

    } catch (error) {
        // Any unexpected system error
        result.status = "error";
        result.totalWorkingMinutes = 0;
        result.overtimeMinutes = 0;
        result.note = "System error occurred";
        result.errorMessage = error.message;
    } finally {
        // Mandatory log
        console.log("Attendance processed successfully");
        console.log("=== ATTENDANCE SUMMARY ===");
        console.log(JSON.stringify(result, null, 2));
    }

    return result;
}

// Example usage
processAttendance({
    employeeId: "EMP001",
    date: "2025-12-17",
    checkIn: "09:00",
    checkOut: "18:30",
    break: {
        start: "13:00"
        // end missing → default 30 minutes
    },
    overtimeApproved: true
});
