tinymce.init({
  selector: "textarea#content",
  height: 400,
  width: 350,
plugins:
          "advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste help wordcount",
        toolbar:
          "undo redo | h3 | h2 | h1 | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | link image | charmap emoticons | preview fullscreen | forecolor backcolor | removeformat | code | help",
        images_upload_url: "upload.php",

        formats: {
          h1: { block: "h1" },
          h2: { block: "h2" },
          h3: { block: "h3" },
          h4: { block: "h4" },
          h5: { block: "h5" },
          h6: { block: "h6" },
        },
});
