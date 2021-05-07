const fs = require('fs');
const AWS = require('aws-sdk');

// Enter copied or downloaded access id and secret here
const ID = 'AKIA4Z244B6XJ6YWLZFQ';
const SECRET = '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';

// Enter the name of the bucket that you have created here
const BUCKET_NAME = 'ocunite';;


// Initializing S3 Interface
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

const uploadFile = (fileName) => {
    // read content from the file
    const fileContent = fs.readFileSync(fileName);

    // setting up s3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: 'IMG_7194-b.mov', // file name you want to save as
        Body: fileContent,
        ACL:'public-read'
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err
        }
        console.log(`File uploaded successfully. ${data.Location}`)
    });
};

// Enter the file you want to upload here
uploadFile('IMG_7194.mov');