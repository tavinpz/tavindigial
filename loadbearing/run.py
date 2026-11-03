import importlib, sys, time
import brand as B
name = sys.argv[1]
mod = importlib.import_module(name)
t0 = time.time()
if name == "storm":
    import sound
    sound.build(mod.SCENE, mod.DUR, "out/ep001.wav")
    mod.SCENE.DUR = mod.DUR
    B.render(mod.SCENE, "out/LB001_the-storm.mp4", "out/ep001.wav")
else:
    mod.render_all() if hasattr(mod, "render_all") else None
    tag = name.split("_")[0][2:]
    mod.SCENE.sound(f"out/ep{tag}.wav")
    B.render(mod.SCENE, f"out/LB{tag}_{name.split('_',1)[1].replace('_','-')}.mp4", f"out/ep{tag}.wav")
print(name, "done", round(time.time() - t0), "s")
