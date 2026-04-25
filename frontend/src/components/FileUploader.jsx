/**
 * Componente para seleccionar un archivo de audio desde el sistema de archivos.
 * @param {{ onFileSelected: (file: File) => void }} props
 */
export function FileUploader({ onFileSelected }) {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div className="file-uploader">
      <label htmlFor="audio-file-input" className="file-label">
        📁 Subir archivo de audio
      </label>
      <input
        id="audio-file-input"
        type="file"
        accept="audio/*,.mp3,.mp4,.wav,.webm,.ogg,.m4a,.flac,.mpeg,.mpga"
        onChange={handleChange}
        aria-label="Seleccionar archivo de audio"
      />
    </div>
  );
}
