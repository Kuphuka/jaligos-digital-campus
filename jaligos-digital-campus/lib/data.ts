export const branches = ["Johannesburg", "Sebokeng", "QwaQwa", "Limpopo"];

// Makes a file name safe to use as a storage path.
export const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

export const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-ZA") : "";
