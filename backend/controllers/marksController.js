const XLSX = require("xlsx");
const Marks = require("../models/Marks");

exports.uploadMarks = async (req,res)=>{
try{

if(!req.file){
return res.status(400).json({message:"No file uploaded"});
}

const workbook = XLSX.readFile(req.file.path);

const sheet = workbook.Sheets[workbook.SheetNames[0]];

const data = XLSX.utils.sheet_to_json(sheet);

console.log("Excel Marks:",data);

const formattedMarks = data.map(row=>({

lndId: row.LNDID,
name: row.Name,
level: Number(row.Level),
year: Number(row.Year),
marks: Number(row.Marks),

// important for seconds precision
submittedAt: new Date(row.SubmittedAt)

}));

console.log("Formatted Marks:",formattedMarks);

const result = await Marks.insertMany(formattedMarks,{ordered:false});

console.log("Inserted Marks:",result.length);

res.json({
message:"Marks uploaded successfully",
inserted:result.length
});

}
catch(error){

console.error("Upload Error:",error);

res.status(500).json({
message:"Upload failed",
error:error.message
});

}
};