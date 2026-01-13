import loadingGif from "../../assets/loading.gif";

interface LoadingOverlayProps {
  isLoading: boolean;
}

export default function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <img
        src={loadingGif}
        alt="Loading..."
        className="w-32 h-32 object-contain"
      />
    </div>
  );
}
