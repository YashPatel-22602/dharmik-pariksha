const Result = require("../models/Result");

exports.getMyResults = async (req, res) => {

try {

const user = req.user;

const results = await Result.find({
lndId: user.lndId
}).sort({ examYear: -1 });

res.json(results);

} catch (err) {

console.error(err);

res.status(500).json({
message: "Failed to fetch results"
});

}

};