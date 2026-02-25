import { useState, useEffect, useRef, useCallback } from "react";

const INTENSITY_PRESETS = {
  gentle: { blur: 3, glowOpacity: 0.22, brightness: 1.08, contrast: 0.91, saturate: 1.08, warmth: 12 },
  medium: { blur: 5, glowOpacity: 0.32, brightness: 1.13, contrast: 0.85, saturate: 1.12, warmth: 20 },
  strong:  { blur: 8, glowOpacity: 0.42, brightness: 1.18, contrast: 0.78, saturate: 1.15, warmth: 28 },
};

export default function YouthMirror() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const glowCanvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);
  const offscreenRef = useRef(null);
  const offCtxRef = useRef(null);

  const [active, setActive] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");
  const [intensity, setIntensity] = useState("medium");
  const [era, setEra] = useState("1950s");
  const [showControls, setShowControls] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [unlockMode, setUnlockMode] = useState(false);

  const ERA_FILTERS = {
    "1920s": { tint: [255, 235, 200], sepia: 0.3 },
    "1930s": { tint: [255, 240, 210], sepia: 0.2 },
    "1940s": { tint: [255, 245, 215], sepia: 0.15 },
    "1950s": { tint: [255, 248, 225], sepia: 0.08 },
    "1960s": { tint: [250, 250, 235], sepia: 0.04 },
  };

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch {
      setCameraError("Camera access denied. Please allow camera permissions and try again.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    streamRef.current = null;
    setActive(false);
    setLocked(false);
    setUnlockMode(false);
  }, []);

  // Apply warm tint to pixel data
  const applyWarmth = useCallback((data, warmth, tint, sepia) => {
    const [tr, tg, tb] = tint;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];
      // Warmth: boost reds/yellows, reduce blues
      r = Math.min(255, r + warmth);
      g = Math.min(255, g + warmth * 0.4);
      b = Math.max(0, b - warmth * 0.6);
      // Sepia tint blend
      if (sepia > 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, r * (1 - sepia) + (gray * (tr / 255)) * sepia);
        g = Math.min(255, g * (1 - sepia) + (gray * (tg / 255)) * sepia);
        b = Math.min(255, b * (1 - sepia) + (gray * (tb / 255)) * sepia);
      }
      data[i] = r; data[i + 1] = g; data[i + 2] = b;
    }
  }, []);

  // Main render loop
  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const glowCanvas = glowCanvasRef.current;
    if (!video || !canvas || !glowCanvas || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const w = canvas.width, h = canvas.height;
    if (!offscreenRef.current || offscreenRef.current.width !== w) {
      offscreenRef.current = new OffscreenCanvas ? new OffscreenCanvas(w, h) : document.createElement("canvas");
      offscreenRef.current.width = w;
      offscreenRef.current.height = h;
      offCtxRef.current = offscreenRef.current.getContext("2d");
    }

    const preset = INTENSITY_PRESETS[intensity];
    const eraOpts = ERA_FILTERS[era];
    const offCtx = offCtxRef.current;
    const ctx = canvas.getContext("2d");
    const glowCtx = glowCanvas.getContext("2d");

    // Draw mirrored video to offscreen
    offCtx.save();
    offCtx.translate(w, 0);
    offCtx.scale(-1, 1);
    offCtx.drawImage(video, 0, 0, w, h);
    offCtx.restore();

    // Get pixel data and apply warmth/tint
    const imageData = offCtx.getImageData(0, 0, w, h);
    applyWarmth(imageData.data, preset.warmth, eraOpts.tint, eraOpts.sepia);
    offCtx.putImageData(imageData, 0, 0);

    // Main canvas: draw base with brightness/contrast/saturation
    ctx.filter = `brightness(${preset.brightness}) contrast(${preset.contrast}) saturate(${preset.saturate})`;
    ctx.drawImage(offscreenRef.current, 0, 0, w, h);
    ctx.filter = "none";

    // Glow layer: draw heavily blurred version
    glowCtx.filter = `blur(${preset.blur}px) brightness(${preset.brightness + 0.1})`;
    glowCtx.drawImage(offscreenRef.current, 0, 0, w, h);
    glowCtx.filter = "none";

    // Blend glow onto main canvas (soft-focus skin smoothing)
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = preset.glowOpacity;
    ctx.drawImage(glowCanvas, 0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    animFrameRef.current = requestAnimationFrame(renderFrame);
  }, [intensity, era, applyWarmth]);

  useEffect(() => {
    if (active) {
      const video = videoRef.current;
      if (video) {
        const onMeta = () => {
          const canvas = canvasRef.current;
          const glow = glowCanvasRef.current;
          const ratio = video.videoWidth / video.videoHeight || 16/9;
          const maxW = Math.min(video.videoWidth || 1280, window.innerWidth);
          const h = Math.round(maxW / ratio);
          if (canvas) { canvas.width = maxW; canvas.height = h; }
          if (glow) { glow.width = maxW; glow.height = h; }
          animFrameRef.current = requestAnimationFrame(renderFrame);
        };
        video.addEventListener("loadedmetadata", onMeta);
        if (video.readyState >= 1) onMeta();
        return () => {
          video.removeEventListener("loadedmetadata", onMeta);
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
      }
    }
  }, [active, renderFrame]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleLock = () => {
    if (!lockPin) { setShowPinSetup(true); return; }
    setLocked(true);
    setShowControls(false);
  };

  const handlePinSetup = () => {
    if (lockPin.length < 4) { setPinError(true); return; }
    if (lockPin !== confirmPin) { setPinError(true); return; }
    setPinError(false);
    setShowPinSetup(false);
    setLocked(true);
    setShowControls(false);
  };

  const handleUnlock = () => {
    if (pinInput === lockPin) {
      setLocked(false);
      setUnlockMode(false);
      setPinInput("");
      setShowControls(true);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1200);
    }
  };

  const eras = ["1920s", "1930s", "1940s", "1950s", "1960s"];
  const intensities = ["gentle", "medium", "strong"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a0a00 0%, #2d1a08 40%, #1a0e04 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#f5e6c8",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Decorative grain overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        opacity: 0.6,
      }} />

      {/* Header */}
      {!active && (
        <div style={{ textAlign: "center", padding: "60px 24px 0", zIndex: 10 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.3em", color: "#c8a96e", textTransform: "uppercase", marginBottom: 16 }}>
            Memory Mirror
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 3.8rem)", fontWeight: 400, margin: "0 0 12px", color: "#f5e6c8", letterSpacing: "-0.01em", lineHeight: 1.15 }}>
            A Glimpse of<br />
            <em style={{ color: "#d4a853", fontStyle: "italic" }}>Your Younger Self</em>
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "#b8a07a", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7 }}>
            A gentle mirror that softens time — reflecting the warmth and glow of your earlier years.
          </p>
        </div>
      )}

      {/* Era & Intensity selectors (pre-launch) */}
      {!active && (
        <div style={{ zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 28, marginBottom: 48, padding: "0 24px", width: "100%", maxWidth: 560 }}>
          <div style={{ width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.25em", color: "#c8a96e", textTransform: "uppercase", marginBottom: 14 }}>Choose Your Era</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {eras.map(e => (
                <button key={e} onClick={() => setEra(e)} style={{
                  padding: "10px 20px", borderRadius: 4, border: era === e ? "1.5px solid #d4a853" : "1.5px solid #4a3520",
                  background: era === e ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.03)",
                  color: era === e ? "#d4a853" : "#9a845c", cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif",
                  transition: "all 0.2s", letterSpacing: "0.05em",
                }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.25em", color: "#c8a96e", textTransform: "uppercase", marginBottom: 14 }}>Filter Strength</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {intensities.map(i => (
                <button key={i} onClick={() => setIntensity(i)} style={{
                  padding: "10px 28px", borderRadius: 4, border: intensity === i ? "1.5px solid #d4a853" : "1.5px solid #4a3520",
                  background: intensity === i ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.03)",
                  color: intensity === i ? "#d4a853" : "#9a845c", cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif",
                  transition: "all 0.2s", textTransform: "capitalize", letterSpacing: "0.05em",
                }}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {cameraError && (
            <div style={{ background: "rgba(180,60,30,0.15)", border: "1px solid rgba(180,60,30,0.4)", borderRadius: 6, padding: "14px 20px", color: "#e8a090", fontSize: 14, textAlign: "center", maxWidth: 400 }}>
              {cameraError}
            </div>
          )}

          <button onClick={startCamera} style={{
            padding: "18px 56px", fontSize: 18, fontFamily: "Georgia, serif",
            background: "linear-gradient(135deg, #d4a853, #b8883a)", color: "#1a0a00",
            border: "none", borderRadius: 6, cursor: "pointer", letterSpacing: "0.08em",
            fontWeight: 700, boxShadow: "0 4px 24px rgba(212,168,83,0.35)", transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 32px rgba(212,168,83,0.45)"; }}
            onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = "0 4px 24px rgba(212,168,83,0.35)"; }}
          >
            Open Mirror
          </button>
        </div>
      )}

      {/* Camera view */}
      {active && (
        <div style={{ position: "relative", width: "100%", maxWidth: "100vw", flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Hidden video element */}
          <video ref={videoRef} style={{ display: "none" }} playsInline muted />

          {/* Hidden glow canvas */}
          <canvas ref={glowCanvasRef} style={{ display: "none" }} />

          {/* Main display canvas */}
          <canvas ref={canvasRef} style={{
            width: "100%", height: "auto", display: "block",
            borderBottom: "1px solid rgba(212,168,83,0.2)",
          }} />

          {/* Vintage vignette overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,4,0,0.65) 100%)",
          }} />

          {/* Era badge */}
          <div style={{
            position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)",
            background: "rgba(26,10,0,0.7)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(212,168,83,0.3)", borderRadius: 20, padding: "6px 20px",
            fontSize: 13, letterSpacing: "0.25em", color: "#d4a853", textTransform: "uppercase",
            pointerEvents: "none",
          }}>
            {era} · {intensity}
          </div>

          {/* Lock overlay — when locked */}
          {locked && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(10,4,0,0.0)",
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              padding: "0 0 32px",
            }}>
              {!unlockMode ? (
                <button onClick={() => setUnlockMode(true)} style={{
                  background: "rgba(26,10,0,0.85)", backdropFilter: "blur(12px)",
                  border: "1.5px solid rgba(212,168,83,0.4)", borderRadius: 8, padding: "12px 32px",
                  color: "#d4a853", fontSize: 14, fontFamily: "Georgia, serif", cursor: "pointer", letterSpacing: "0.1em",
                }}>
                  🔒 Carer Unlock
                </button>
              ) : (
                <div style={{
                  background: "rgba(20,8,0,0.95)", backdropFilter: "blur(16px)",
                  border: "1.5px solid rgba(212,168,83,0.35)", borderRadius: 12, padding: "28px 36px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 16, minWidth: 280,
                }}>
                  <div style={{ fontSize: 12, letterSpacing: "0.2em", color: "#c8a96e", textTransform: "uppercase" }}>Carer PIN</div>
                  <input
                    type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                    value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={e => e.key === "Enter" && handleUnlock()}
                    style={{
                      width: "100%", padding: "14px 18px", fontSize: 24, letterSpacing: "0.4em", textAlign: "center",
                      background: "rgba(255,255,255,0.05)", border: pinError ? "1.5px solid #e05030" : "1.5px solid rgba(212,168,83,0.35)",
                      borderRadius: 6, color: "#f5e6c8", fontFamily: "Georgia, serif", outline: "none",
                      transition: "border 0.2s",
                    }}
                    placeholder="• • • •"
                    autoFocus
                  />
                  {pinError && <div style={{ color: "#e05030", fontSize: 13 }}>Incorrect PIN</div>}
                  <div style={{ display: "flex", gap: 12, width: "100%" }}>
                    <button onClick={() => { setUnlockMode(false); setPinInput(""); }} style={{
                      flex: 1, padding: "12px", borderRadius: 6, border: "1px solid rgba(212,168,83,0.25)",
                      background: "transparent", color: "#9a845c", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 14,
                    }}>Cancel</button>
                    <button onClick={handleUnlock} style={{
                      flex: 1, padding: "12px", borderRadius: 6, border: "none",
                      background: "linear-gradient(135deg, #d4a853, #b8883a)", color: "#1a0a00",
                      cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700,
                    }}>Unlock</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controls bar — shown when not locked */}
          {!locked && showControls && (
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(0deg, rgba(10,4,0,0.95) 0%, rgba(10,4,0,0.6) 80%, transparent 100%)",
              padding: "40px 24px 24px", display: "flex", flexDirection: "column", gap: 16,
            }}>
              {/* Era switcher */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {eras.map(e => (
                  <button key={e} onClick={() => setEra(e)} style={{
                    padding: "6px 14px", borderRadius: 20, border: era === e ? "1px solid #d4a853" : "1px solid rgba(212,168,83,0.2)",
                    background: era === e ? "rgba(212,168,83,0.2)" : "rgba(255,255,255,0.04)",
                    color: era === e ? "#d4a853" : "#7a6040", cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif", letterSpacing: "0.05em",
                  }}>{e}</button>
                ))}
              </div>

              {/* Intensity switcher */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {intensities.map(i => (
                  <button key={i} onClick={() => setIntensity(i)} style={{
                    padding: "6px 18px", borderRadius: 20, border: intensity === i ? "1px solid #d4a853" : "1px solid rgba(212,168,83,0.2)",
                    background: intensity === i ? "rgba(212,168,83,0.2)" : "rgba(255,255,255,0.04)",
                    color: intensity === i ? "#d4a853" : "#7a6040", cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif", textTransform: "capitalize", letterSpacing: "0.05em",
                  }}>{i}</button>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={handleLock} style={{
                  padding: "13px 32px", borderRadius: 6, fontSize: 14, fontFamily: "Georgia, serif",
                  background: "linear-gradient(135deg, #d4a853, #b8883a)", color: "#1a0a00",
                  border: "none", cursor: "pointer", fontWeight: 700, letterSpacing: "0.08em",
                }}>
                  🔒 Lock Screen
                </button>
                <button onClick={stopCamera} style={{
                  padding: "13px 24px", borderRadius: 6, fontSize: 14, fontFamily: "Georgia, serif",
                  background: "rgba(180,60,30,0.15)", color: "#e08060",
                  border: "1px solid rgba(180,60,30,0.35)", cursor: "pointer", letterSpacing: "0.05em",
                }}>
                  Close Mirror
                </button>
              </div>
            </div>
          )}

          {/* Tap to show controls when not locked */}
          {!locked && !showControls && (
            <div style={{ position: "absolute", inset: 0, cursor: "pointer" }} onClick={() => setShowControls(true)} />
          )}
        </div>
      )}

      {/* PIN Setup Modal */}
      {showPinSetup && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(10,4,0,0.92)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24,
        }}>
          <div style={{
            background: "linear-gradient(160deg, #1e0e04, #150900)",
            border: "1.5px solid rgba(212,168,83,0.35)", borderRadius: 14, padding: "40px 36px",
            width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 20, alignItems: "center",
          }}>
            <div style={{ fontSize: 11, letterSpacing: "0.25em", color: "#c8a96e", textTransform: "uppercase" }}>Set Carer Lock PIN</div>
            <p style={{ color: "#9a845c", fontSize: 14, textAlign: "center", margin: 0, lineHeight: 1.6 }}>
              Create a PIN so only carers can unlock or close the mirror
            </p>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="Choose PIN (4–6 digits)"
                value={lockPin} onChange={e => setLockPin(e.target.value.replace(/\D/g, ""))}
                style={{
                  width: "100%", padding: "14px 18px", fontSize: 20, letterSpacing: "0.3em", textAlign: "center",
                  background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(212,168,83,0.3)",
                  borderRadius: 6, color: "#f5e6c8", fontFamily: "Georgia, serif", outline: "none", boxSizing: "border-box",
                }}
              />
              <input
                type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="Confirm PIN"
                value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                style={{
                  width: "100%", padding: "14px 18px", fontSize: 20, letterSpacing: "0.3em", textAlign: "center",
                  background: "rgba(255,255,255,0.05)", border: pinError ? "1.5px solid #e05030" : "1.5px solid rgba(212,168,83,0.3)",
                  borderRadius: 6, color: "#f5e6c8", fontFamily: "Georgia, serif", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            {pinError && <div style={{ color: "#e05030", fontSize: 13 }}>PINs don't match or too short</div>}
            <div style={{ display: "flex", gap: 12, width: "100%" }}>
              <button onClick={() => { setShowPinSetup(false); setLockPin(""); setConfirmPin(""); setPinError(false); }} style={{
                flex: 1, padding: "13px", borderRadius: 6, border: "1px solid rgba(212,168,83,0.25)",
                background: "transparent", color: "#9a845c", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 14,
              }}>Cancel</button>
              <button onClick={handlePinSetup} style={{
                flex: 1, padding: "13px", borderRadius: 6, border: "none",
                background: "linear-gradient(135deg, #d4a853, #b8883a)", color: "#1a0a00",
                cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700,
              }}>Set PIN & Lock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}