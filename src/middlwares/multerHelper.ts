import multer, {memoryStorage} from "multer"

export default multer({
 storage: memoryStorage(),

 fileFilter:  (req: any, file: any, cb: any) => {
  if(!file.mimetype.includes("excel") || !file.mimetype.includes("spreadsheetml") || !file.mimetype.includes("csv")) {
   cb(null, true)
  } else {
   cb(new Error("File type should either be in excel and csv format"), false)
   return;
  }
 }
})