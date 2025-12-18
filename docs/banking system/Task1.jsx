// Banking System – Transaction & Balance Validator
// All logic is inside try, all errors handled in catch, audit log in finally

const inputData = {
    accountNumber: "ACC12345",
    accountHolder: "John Doe",
    initialBalance: "1000.50",
    currency: "USD",
    transactions: [
        { type: "Deposit", amount: "500" },
        { type: "Withdraw", amount: 300 },
        { type: "Withdraw", amount: "1500" },   // insufficient balance
        { type: "Deposit", amount: "-50" },     // invalid amount
        { type: "Transfer", amount: 100 },      // invalid type
        { amount: 200 },                         // missing type
        { type: "Withdraw", amount: "abc" }     // invalid number
    ]
};

let output = {
    accountNumber: null,
    accountHolder: null,
    currency: null,
    initialBalance: 0,
    finalBalance: 0,
    appliedTransactions: [],
    rejectedTransactions: [],
    auditLog: ""
};

try {
    // Copy basic account info (do not modify original input)
    output.accountNumber = inputData.accountNumber || "UNKNOWN";
    output.accountHolder = inputData.accountHolder || "UNKNOWN";
    output.currency = inputData.currency || "UNKNOWN";

    // Safely convert initial balance
    let balance = Number(inputData.initialBalance);
    if (isNaN(balance)) {
        throw new Error("Invalid initial balance");
    }
    output.initialBalance = balance;

    // Process transactions
    const transactions = Array.isArray(inputData.transactions)
        ? inputData.transactions.slice()
        : [];

    for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        try {
            if (!tx || !tx.type) {
                throw new Error("Missing transaction type");
            }

            const amount = Number(tx.amount);
            if (isNaN(amount)) {
                throw new Error("Invalid amount");
            }
            if (amount <= 0) {
                throw new Error("Amount must be greater than zero");
            }

            if (tx.type === "Deposit") {
                balance += amount;
                output.appliedTransactions.push({
                    type: tx.type,
                    amount: amount
                });
            } else if (tx.type === "Withdraw") {
                if (amount > balance) {
                    throw new Error("Insufficient balance");
                }
                balance -= amount;
                output.appliedTransactions.push({
                    type: tx.type,
                    amount: amount
                });
            } else {
                throw new Error("Unknown transaction type");
            }
        } catch (txError) {
            output.rejectedTransactions.push({
                transaction: tx,
                reason: txError.message
            });
        }
    }

    output.finalBalance = balance;

} catch (error) {
    // System-level error handling
    output.rejectedTransactions.push({
        transaction: null,
        reason: "System Error"
    });
} finally {
    // Audit log & completion message
    output.auditLog = "Transaction processing completed successfully.";
    console.log("=== ACCOUNT SUMMARY ===");
    console.log(JSON.stringify(output, null, 2));
    console.log("Processing finished.");
}
