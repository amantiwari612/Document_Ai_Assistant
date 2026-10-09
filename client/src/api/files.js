// const API_URL= "http://localhost:3000/api";
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export async function uploadFile(file){
  const formData= new FormData();
  formData.append("file",file);
  const res= await fetch(`${API_BASE}/files`,
    {
      method:"POST",
      body:formData
    }
  );
  const data=await response.json();
  if(!(response.ok)){
    throw new Error(data.error ||"Failed to upload")
  }
  return data;

}

export async function getFiles(){
  const response=await fetch(`${API_URL}/files`);
  const data=await response.json();
  if(!(response.ok)){
    throw new Error(data.error || "Failed to fetch files");
  }
  return data;
}

export async function deleteFile(filename){
  const response=await fetch(`${API_URL}/files/${filename}`,
    {
      method:"DELETE"
    }
  );
  const data=await response.json();
  if(!(response.ok)){
    throw new Error(data.error || "Failed to delete file");
  }
  return data;
}