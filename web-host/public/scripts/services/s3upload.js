'user strict';

app
  .factory('uploadImage', (Upload) => {
    // Place your proper data here - http://beckcd.com/nashville/software/school/2014/11/29/file-uploading-with-angular/
    const S3url = 'https://minovate.s3.amazonaws.com/';
    const awsaccesskeyid = 'AKIAJBBPAYNMFYC6YMWQ';
    const policy = 'eyJleHBpcmF0aW9uIjoiMjAyMC0wMS0wMVQwMDowMDowMFoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJtaW5vdmF0ZSJ9LHsiYWNsIjogInB1YmxpYy1yZWFkIn0sWyJzdGFydHMtd2l0aCIsIiRDb250ZW50LVR5cGUiLCIiXSxbInN0YXJ0cy13aXRoIiwiJGtleSIsIiJdXX0=';
    const signature = 'xpE4b93F9hQNCOwpKEno60jPwG8=';

    function uploadToS3(file, user, cb) {
      const userID = user.uid.replace(/:/g, '');
      const time = moment().format('x');

      // Make sure to put in your aws access key id, your policy string from irb output and yur signature from irb output
      Upload.upload({
        url: S3url,
        method: 'POST',
        data: {
          'Content-Type': file.type !== '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
          key: `${userID}/${time}_${file.name}`,
          acl: 'public-read',
          awsaccesskeyid,
          policy,
          signature,
          // this is the image you want to upload (must have been through base 64 encoding first)
          file,
        },
      }).then((resp) => {
        console.log(`Success ${resp.config.data.file.name}uploaded. Response: ${resp.data}`);
        // the link where photo can be accessed - CHANGE TO YOUR PROPER PATH
        const filelink = `https://s3.amazonaws.com/minovate/${userID}/${time}_${resp.config.data.file.name}`;

        // function that sends file link to database
        cb(filelink);
      }, (resp) => {
        console.log(resp);
        console.log(`Error status: ${resp.status}`);
      }, (evt) => {
        const progressPercentage = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        file.progress = progressPercentage;
        console.log(`progress: ${progressPercentage}% ${evt.config.data.file.name}`);
      });
    }

    function uploadMultiple(files, user, cb) {
      const userID = user.uid.replace(/:/g, '');
      const time = moment().format('x');

      // Make sure to put in your aws access key id, your policy string from irb output and yur signature from irb output
      angular.forEach(files, (value, key) => {
        Upload.upload({
          url: S3url,
          method: 'POST',
          data: {
            'Content-Type': value.type !== '' ? value.type : 'application/octet-stream', // content type of the file (NotEmpty)
            key: `${userID}/${time}_${value.name}`,
            acl: 'public-read',
            awsaccesskeyid,
            policy,
            signature,
            // this is the image you want to upload (must have been through base 64 encoding first)
            file: value,
          },
        }).then((resp) => {
          console.log(`Success ${resp.config.data.file.name}uploaded. Response: ${resp.data}`);
          // the link where photo can be accessed - CHANGE TO YOUR PROPER PATH
          const filelink = `https://s3.amazonaws.com/minovate/${userID}/${time}_${resp.config.data.file.name}`;

          // function that sends file link to database
          cb(filelink);
        }, (resp) => {
          console.log(resp);
          console.log(`Error status: ${resp.status}`);
        }, (evt) => {
          const progressPercentage = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
          value.progress = progressPercentage;
          console.log(`progress: ${progressPercentage}% ${evt.config.data.file.name}`);
        });
      });
    }

    function setThumbnail(file, cb) {
      _imageToBase64(file, (base64) => {
        const fileName = file.name;
        cb(fileName, base64);
      });
    }

    // turns image into Base 64 file type to allow uploading
    function _imageToBase64(file, cb) {
      if (file && file.type.indexOf('image') > -1) {
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = function (e) {
          cb(e.target.result);
        };
      }
    }

    return {
      uploadToS3,
      uploadMultiple,
      setThumbnail,
    };
  });
