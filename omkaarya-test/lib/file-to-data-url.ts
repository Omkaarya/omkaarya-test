/** Browser-only: reads a selected file into a data URL (`data:image/...;base64,...`). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      if (typeof reader.result !== "string") return reject(new Error("Invalid file reader result"));
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
