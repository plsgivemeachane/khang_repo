const cloudName = "dceqnckf1"; // Cloudinary Cloud Name
const uploadPreset = "ij7u3f7k"; // Cloudinary Upload Preset

tinymce.init({
  selector: "textarea.decs_textarea",
  menubar: "file edit view format tools table help",
  height: 500,
  plugins:
    "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker",
  toolbar:
    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
  image_title: true,
  automatic_uploads: true,
  file_picker_types: "image",

  // Bắt sự kiện khi chọn ảnh
  file_picker_callback: (cb, value, meta) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");

    input.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

   
      const overlay = document.querySelector(".tox-dialog")
     
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      const loading = document.createElement("div");
      if(overlay){
         loading.classList.add("loading");
         overlay.appendChild(loading);
      }
      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();
        if(overlay){
          overlay.removeChild(loading);
        }

       

        // Chèn ảnh vào TinyMCE
        cb(result.secure_url, { title: file.name });

      } catch (error) {
        console.error("Upload Error:", error);
        loading.remove();
        alert("Lỗi tải ảnh lên!");
      }
    });

    input.click();
  },
  content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
  
});
