// this handles the ui of the file upload, where the users upload a file for the backend to process

export default function FileUploader({ onUpload }) {
    return (
      <div className="upload-box">
        <label htmlFor="file-input">Click here to upload vendor files</label>
        <input
          id="file-input"
          type="file"
          multiple
          onChange={(e) => onUpload(e.target.files)}
        />
      </div>
    );
  }
  