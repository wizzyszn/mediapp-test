import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  X,
  Maximize2,
  Minimize2,
  Loader2,
  VideoOff as VideoOffIcon,
  GripHorizontal,
} from "lucide-react";
import { Rnd } from "react-rnd";
import { DailyProvider } from "@daily-co/daily-react";
import { useDailyVideoRoom } from "../daily/use-daily-video-room.hook";
import type {
  DailyVideoSession,
  DailyParticipantTile,
} from "../daily/daily-video-room.types";
import { Button } from "@/components/ui/button";

export interface VideoCallProps {
  session?: DailyVideoSession | null;
  displayName: string;
  role: "doctor" | "patient";
  appointmentId: string;
  scheduledEndAtUtc?: string | null;
  onLeave: () => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isUnavailable?: boolean;
}

function ParticipantVideo({
  participant,
  className,
}: {
  participant: DailyParticipantTile;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = participant.videoStream;
  }, [participant.videoStream]);

  if (!participant.videoStream && !participant.isVideoEnabled) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 overflow-hidden ${className}`}
      >
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-inner">
          <span className="text-xl font-medium text-primary">
            {participant.displayName.charAt(0)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={participant.isLocal}
      className={`object-cover bg-black ${className}`}
    />
  );
}

function VideoCallInner({
  session,
  displayName,
  role,
  appointmentId,
  isExpanded,
  setIsExpanded,
  onLeave,
}: {
  session: DailyVideoSession;
  displayName: string;
  role: "doctor" | "patient";
  appointmentId: string;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  onLeave: () => void;
}) {
  const {
    callObject,
    connectionStatus,
    isCameraEnabled,
    isMicrophoneEnabled,
    localParticipant,
    remoteParticipants,
    leaveMeeting,
    toggleCamera,
    toggleMicrophone,
  } = useDailyVideoRoom(session, displayName, role, appointmentId);

  const mainParticipant =
    remoteParticipants.length > 0 ? remoteParticipants[0] : localParticipant;

  const isJoined =
    connectionStatus === "joined" || connectionStatus === "waiting";

  const handleLeave = async () => {
    await leaveMeeting();
    onLeave();
  };

  if (isExpanded) {
    return (
      <DailyProvider callObject={callObject}>
        <div className="fixed inset-0 z-[100] flex flex-col bg-white">
          {/* Header */}
          <header className="h-16 bg-primary flex items-center justify-between px-6 shrink-0 z-50 shadow-sm relative">
            <div className="flex items-center gap-3">
              <div className="size-2 bg-green-400 rounded-full shadow-lg animate-pulse" />
              <span className="text-sm text-primary-foreground font-medium">
                daily.co - {connectionStatus}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Minimize to PIP"
            >
              <Minimize2 className="size-5 text-primary-foreground" />
            </button>
          </header>

          {/* Main Video Area */}
          <div className="flex-1 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative overflow-hidden">
            {mainParticipant ? (
              <ParticipantVideo
                participant={mainParticipant}
                className="size-full absolute inset-0"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 z-10">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <div className="text-white bg-gray-900/50 px-6 py-3 rounded-full border border-white/10 shadow-xl">
                  Connecting...
                </div>
              </div>
            )}

            {mainParticipant && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                <div className="text-white bg-gray-900/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-xl">
                  <span className="text-sm font-medium">
                    {mainParticipant.displayName}
                  </span>
                </div>
              </div>
            )}

            {/* Picture in Picture of Local */}
            {mainParticipant !== localParticipant && localParticipant && (
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 w-24 sm:w-32 md:w-48 aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl z-30">
                <ParticipantVideo
                  participant={localParticipant}
                  className="size-full"
                />
                <div className="absolute bottom-1 left-2 bg-black/50 px-2 py-0.5 rounded text-[10px] text-white">
                  You
                </div>
              </div>
            )}

            {/* Status Indicators */}
            {!isMicrophoneEnabled && (
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-red-500/90 backdrop-blur text-white p-2 sm:p-3 rounded-full shadow-lg z-20">
                <MicOff className="size-4 sm:size-5" />
              </div>
            )}
            {!isCameraEnabled && (
              <div className="absolute top-4 sm:top-6 left-16 sm:left-20 bg-red-500/90 backdrop-blur text-white p-2 sm:p-3 rounded-full shadow-lg z-20">
                <VideoOff className="size-4 sm:size-5" />
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="h-20 sm:h-24 bg-white border-t border-gray-200 flex items-center justify-center shrink-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => void toggleMicrophone()}
                className={`p-3 sm:p-4 rounded-full transition-colors shadow-sm ${
                  !isMicrophoneEnabled
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200"
                }`}
              >
                {!isMicrophoneEnabled ? (
                  <MicOff className="size-5 sm:size-6" />
                ) : (
                  <Mic className="size-5 sm:size-6" />
                )}
              </button>

              <button
                onClick={() => void toggleCamera()}
                className={`p-3 sm:p-4 rounded-full transition-colors shadow-sm ${
                  !isCameraEnabled
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200"
                }`}
              >
                {!isCameraEnabled ? (
                  <VideoOff className="size-5 sm:size-6" />
                ) : (
                  <Video className="size-5 sm:size-6" />
                )}
              </button>
              <div className="w-px h-6 sm:h-8 bg-gray-200 mx-1 sm:mx-2" />
              <button
                onClick={() => void handleLeave()}
                className="px-4 py-2 sm:px-6 sm:py-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-colors shadow-sm text-sm sm:text-base"
              >
                Leave Call
              </button>
            </div>
          </div>
        </div>
      </DailyProvider>
    );
  }

  // Content for PIP Window
  return (
    <DailyProvider callObject={callObject}>
      <div className="size-full bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center relative ">
        {mainParticipant ? (
          <ParticipantVideo
            participant={mainParticipant}
            className="size-full absolute inset-0"
          />
        ) : (
          <Loader2 className="h-6 w-6 text-white animate-spin z-10" />
        )}
        {mainParticipant && (
          <div className="absolute bottom-2 left-2 text-white bg-gray-900/50 backdrop-blur-sm px-2 py-1 rounded-md z-20 pointer-events-none">
            <span className="text-[10px] font-medium">
              {mainParticipant.displayName}
            </span>
          </div>
        )}
      </div>

      {!isMicrophoneEnabled && (
        <div className="absolute top-2 left-2 bg-red-500/90 text-white p-1.5 rounded-full shadow-lg z-30 pointer-events-none">
          <MicOff className="size-3" />
        </div>
      )}

      {!isCameraEnabled && (
        <div className="absolute top-2 left-10 bg-red-500/90 text-white p-1.5 rounded-full shadow-lg z-30 pointer-events-none">
          <VideoOff className="size-3" />
        </div>
      )}

      <div className="absolute inset-0 z-40 bg-transparent flex items-end justify-center pb-3 opacity-0 hover:opacity-100 hover:bg-black/30 transition-all duration-200">
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg translate-y-2 hover:translate-y-0 transition-transform">
          <button
            onClick={(e) => {
              e.stopPropagation();
              void toggleMicrophone();
            }}
            className={`p-1.5 rounded-full transition-colors ${
              !isMicrophoneEnabled
                ? "bg-red-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            {!isMicrophoneEnabled ? (
              <MicOff className="size-3.5" />
            ) : (
              <Mic className="size-3.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              void toggleCamera();
            }}
            className={`p-1.5 rounded-full transition-colors ${
              !isCameraEnabled
                ? "bg-red-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            {!isCameraEnabled ? (
              <VideoOff className="size-3.5" />
            ) : (
              <Video className="size-3.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
          >
            <Maximize2 className="size-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              void handleLeave();
            }}
            className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/40 to-transparent p-2 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 mt-5">
          {isJoined && (
            <div className="size-2 bg-green-400 rounded-full shadow-lg animate-pulse" />
          )}
          <span className="text-[10px] text-white font-medium drop-shadow-md">
            daily.co - {connectionStatus}
          </span>
        </div>
      </div>
    </DailyProvider>
  );
}

export function VideoCall({
  session,
  displayName,
  role,
  appointmentId,
  onLeave,
  isLoading,
  isError,
  onRetry,
  isUnavailable,
}: VideoCallProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isExpanded && session) {
    return (
      <VideoCallInner
        session={session}
        displayName={displayName}
        role={role}
        appointmentId={appointmentId}
        isExpanded={true}
        setIsExpanded={setIsExpanded}
        onLeave={onLeave}
      />
    );
  }

  const pipContent = (
    <Rnd
      default={{
        x:
          typeof window !== "undefined"
            ? Math.max(10, window.innerWidth - 340)
            : 100,
        y:
          typeof window !== "undefined"
            ? Math.max(10, window.innerHeight - 240)
            : 100,
        width:
          typeof window !== "undefined" && window.innerWidth < 400 ? 240 : 320,
        height:
          typeof window !== "undefined" && window.innerWidth < 400 ? 166 : 221,
      }}
      minWidth={160}
      minHeight={110}
      maxWidth={800}
      maxHeight={479}
      lockAspectRatio={16 / 9}
      lockAspectRatioExtraHeight={29}
      dragHandleClassName="drag-handle"
      bounds="window"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      style={{
        position: "fixed",
        zIndex: 50,
      }}
    >
      <div className="size-full relative rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] drop-shadow-2xl border border-gray-200 bg-white flex flex-col">
        <div className="drag-handle w-full flex items-center justify-center p-1.5 cursor-move bg-primary text-primary-foreground shadow-sm active:cursor-grabbing transition-colors z-50 shrink-0">
          <GripHorizontal className="size-4" />
        </div>

        <div className="flex-1 w-full overflow-hidden bg-white">
          {isUnavailable ? (
            <div className="size-full flex flex-col items-center justify-center px-4 text-center bg-gray-50">
              <VideoOffIcon className="h-6 w-6 text-gray-400" />
              <p className="mt-2 text-xs text-gray-500">
                Video session unavailable
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 text-[10px] h-7"
                onClick={onLeave}
              >
                Close
              </Button>
            </div>
          ) : isLoading ? (
            <div className="size-full flex flex-col items-center justify-center bg-gray-50">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <p className="mt-2 text-xs text-gray-500">Preparing room...</p>
            </div>
          ) : isError || !session ? (
            <div className="size-full flex flex-col items-center justify-center px-4 text-center bg-gray-50">
              <p className="text-xs font-semibold text-gray-700">
                Unable to load
              </p>
              <div className="mt-2 flex flex-wrap gap-2 justify-center">
                {onRetry && (
                  <Button
                    size="sm"
                    className="h-7 text-[10px]"
                    onClick={onRetry}
                  >
                    Retry
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px]"
                  onClick={onLeave}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <VideoCallInner
              session={session}
              displayName={displayName}
              role={role}
              appointmentId={appointmentId}
              isExpanded={false}
              setIsExpanded={setIsExpanded}
              onLeave={onLeave}
            />
          )}
        </div>
      </div>
    </Rnd>
  );

  return createPortal(pipContent, document.body);
}
