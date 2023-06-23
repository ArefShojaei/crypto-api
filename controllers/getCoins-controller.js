const fs = require('fs/promises');
const path = require('path');

module.exports = async (req, res) => {
    try {
        const response = await fs.readFile(path.join(__dirname, "../coinsList.json"), "utf-8")
        const coinsList = JSON.parse(response)
    
        res.status(200).json(coinsList)
    } catch (err) {
        return res.status(500).json({
            status : "Error",
            code : 500,
            msg : "Request is failed!"
        })
    }
}