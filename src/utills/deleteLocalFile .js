import fs from "fs";

const deleteLocalFile = (localfilePath) => {
    if(!localfilePath) return;
    fs.unlink(localfilePath, (err) => {
        if (err) return console.log("Error while deleting the file: ", err.message);
        console.log(`File is deleted successfully ${localfilePath}`);
    });
};

export { deleteLocalFile };