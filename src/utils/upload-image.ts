function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
}

async function uploadViaImgbb(file: File, apiKey: string): Promise<string> {
  const dataUrl = await fileToBase64(file);
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;

  const body = new FormData();
  body.append("image", base64);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
    { method: "POST", body },
  );

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { url?: string };
    error?: { message?: string };
  };

  if (!response.ok || !payload.success || !payload.data?.url) {
    throw new Error(payload.error?.message ?? "Échec de l'upload ImgBB");
  }

  return payload.data.url;
}

async function uploadViaLitterbox(file: File): Promise<string> {
  const body = new FormData();
  body.append("reqtype", "fileupload");
  body.append("time", "24h");
  body.append("fileToUpload", file);

  const response = await fetch(
    "https://litterbox.catbox.moe/resources/internals/api.php",
    { method: "POST", body },
  );

  const url = (await response.text()).trim();
  if (!response.ok || !url.startsWith("http")) {
    throw new Error("Échec de l'upload temporaire de l'image");
  }

  return url;
}

export async function uploadImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Seules les images sont acceptées");
  }

  const imgbbKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (imgbbKey) {
    return uploadViaImgbb(file, imgbbKey);
  }

  return uploadViaLitterbox(file);
}

export async function uploadImageFiles(files: File[]): Promise<string[]> {
  return Promise.all(files.map((file) => uploadImageFile(file)));
}
