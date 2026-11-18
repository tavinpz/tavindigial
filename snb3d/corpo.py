# Personagem 3D do Strong Not Big: malha CC0 do MakeHuman + alvos de músculo, render com sombra chapada e traço.
import bpy, gzip, json, sys, math, os
from mathutils import Vector
D = '/home/claude/mh/mpfb/src/mpfb/data'
ARGS = json.loads(sys.argv[sys.argv.index('--') + 1]) if '--' in sys.argv else {}
MIX = ARGS.get('mix', {'universal-male-young-maxmuscle-averageweight': 0.65, 'universal-male-young-maxmuscle-minweight': 0.35, 'caucasian-male-young': 1.0})
SAIDA = ARGS.get('saida', '/home/claude/mh/out/corpo.png')

vs, faces = [], {}; g = None
for l in open(f'{D}/3dobjs/base.obj'):
    if l.startswith('v '): vs.append([float(x) for x in l.split()[1:4]])
    elif l.startswith('g '): g = l.split()[1]
    elif l.startswith('f '): faces.setdefault(g, []).append([int(p.split('/')[0]) - 1 for p in l.split()[1:]])
for nome, w in MIX.items():
    for l in gzip.open(f'{D}/targets/macrodetails/{nome}.target.gz', 'rt'):
        p = l.split()
        if len(p) == 4:
            i = int(p[0]); vs[i][0] += w * float(p[1]); vs[i][1] += w * float(p[2]); vs[i][2] += w * float(p[3])
print('grupos', [k for k in faces if not k.startswith(('joint', 'helper'))], len(vs))

bpy.ops.wm.read_factory_settings(use_empty=True)
def malha(nome, grupos, filtro=None):
    fs = [f for k in grupos for f in faces.get(k, [])]
    if filtro: fs = [f for f in fs if filtro(f)]
    usados = sorted({i for f in fs for i in f}); mp = {i: n for n, i in enumerate(usados)}
    me = bpy.data.meshes.new(nome)
    me.from_pydata([(vs[i][0], -vs[i][2], vs[i][1]) for i in usados], [], [[mp[i] for i in f] for f in fs]); me.update()
    ob = bpy.data.objects.new(nome, me); bpy.context.collection.objects.link(ob)
    for p in me.polygons: p.use_smooth = True
    return ob, usados
corpo, idx = malha('corpo', ['body'])
olhos, _ = malha('olhos', ['helper-l-eye', 'helper-r-eye'])
sub = corpo.modifiers.new('sub', 'SUBSURF'); sub.levels = 1; sub.render_levels = 2

def toon(nome, cor, tam=0.56, suave=0.0):
    m = bpy.data.materials.new(nome); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); t = nt.nodes.new('ShaderNodeBsdfToon')
    t.inputs['Color'].default_value = (*cor, 1); t.inputs['Size'].default_value = tam; t.inputs['Smooth'].default_value = suave
    t2 = nt.nodes.new('ShaderNodeBsdfToon'); t2.inputs['Color'].default_value = (*cor, 1); t2.inputs['Size'].default_value = min(0.9, tam + 0.22); t2.inputs['Smooth'].default_value = suave
    mx = nt.nodes.new('ShaderNodeMixShader'); mx.inputs[0].default_value = 0.42
    nt.links.new(t.outputs[0], mx.inputs[1]); nt.links.new(t2.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], o.inputs[0]); return m
def hexa(h): return tuple(((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (1, 3, 5))
pele = toon('pele', hexa('#F4EEE2')); short = toon('short', hexa('#E3311D')); branco = toon('branco', (1, 1, 1), 0.9)
corpo.data.materials.append(pele); corpo.data.materials.append(short); olhos.data.materials.append(branco)

zs = [v.co.z for v in corpo.data.vertices]; zmin, zmax = min(zs), max(zs); H = zmax - zmin
print('altura', round(H, 2), 'zmin', round(zmin, 2))
rel = lambda i: (vs[i][1] - zmin) / H
# short de verdade: pedaço da malha auxiliar "tights", alisado e inflado
sh, _ = malha('short', ['helper-tights'], lambda f: 0.40 < sum(rel(i) for i in f) / len(f) < 0.575)
import bmesh
bm = bmesh.new(); bm.from_mesh(sh.data); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(sh.data); bm.free()
sm = sh.modifiers.new('liso', 'SMOOTH'); sm.factor = 0.6; sm.iterations = 5
dp = sh.modifiers.new('infla', 'DISPLACE'); dp.strength = 0.42; dp.mid_level = 0
s2 = sh.modifiers.new('sub', 'SUBSURF'); s2.levels = 1; s2.render_levels = 2
sh.data.materials.append(short)
# olhos: íris e sobrancelhas
import random; random.seed(ARGS.get('semente', 3))
escuro = toon('escuro', (0.004, 0.004, 0.005), 0.9)
for lado in ('l', 'r'):
    ids = sorted({i for f in faces[f'helper-{lado}-eye'] for i in f}); c = Vector((sum(vs[i][0] for i in ids) / len(ids), -sum(vs[i][2] for i in ids) / len(ids), sum(vs[i][1] for i in ids) / len(ids)))
    r = max(abs(vs[i][0] - c.x) for i in ids)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r * 0.5, location=(c.x, c.y - r * 0.66, c.z), segments=24, ring_count=12); bpy.context.object.data.materials.append(escuro)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(c.x, c.y - r * 1.05, c.z + r * 1.25)); sb = bpy.context.object
    sb.scale = (r * 2.9, r * 0.5, r * 0.42); sb.rotation_euler = (0, math.radians(14 if c.x > 0 else -14), 0); sb.data.materials.append(escuro)
# cabelo: couro cabeludo tirado da própria cabeça + espetos curtos no topo
cab = toon('cabelo', hexa(ARGS.get('cabelo', '#343843')), 0.7)
ol = sorted({i for f in faces['helper-l-eye'] + faces['helper-r-eye'] for i in f}); ez = sum(vs[i][1] for i in ol) / len(ol); ey = -sum(vs[i][2] for i in ol) / len(ol)
def no_couro(f):
    z = sum(vs[i][1] for i in f) / len(f); y = -sum(vs[i][2] for i in f) / len(f)
    return z > ez + 0.62 or (z > ez - 0.25 and y > ey + 1.15)
hc, hid = malha('couro', ['body'], no_couro); hc.data.materials.append(cab); dh = hc.modifiers.new('i', 'DISPLACE'); dh.strength = 0.11; dh.mid_level = 0
pts = [Vector((vs[i][0], -vs[i][2], vs[i][1])) for i in hid]; ztop = max(p.z for p in pts); cc = Vector((0, ey + 0.9, ez + 0.2))
estilo = ARGS.get('estilo', 'espetado')
topo = [p for p in pts if p.z > ztop - (0.75 if estilo == 'espetado' else 0.0)]; random.shuffle(topo)
for p in topo[: (ARGS.get('n', 38) if estilo == 'espetado' else 0)]:
    d = (p - cc).normalized(); d = (d + Vector((0, -0.12, 0.35))).normalized()
    L = random.uniform(0.45, 1.05) * ARGS.get('compr', 1.0)
    bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.2, radius2=0.0, depth=L, location=p + d * (L * 0.40)); o = bpy.context.object
    o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = d.to_track_quat('Z', 'Y'); o.data.materials.append(cab)
if ARGS.get('faixa'):
    fx = toon('faixa', hexa('#E3311D'))
    fm, _ = malha('faixa', ['body'], lambda f: abs(sum(vs[i][1] for i in f) / len(f) - (ez + 0.62)) < 0.16 and no_couro(f) or abs(sum(vs[i][1] for i in f) / len(f) - (ez + 0.62)) < 0.16); fm.data.materials.append(fx)
    d2 = fm.modifiers.new('i', 'DISPLACE'); d2.strength = 0.17; d2.mid_level = 0

sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = ARGS.get('amostras', 24); sc.cycles.use_denoising = False
sc.render.resolution_x, sc.render.resolution_y = ARGS.get('res', [1080, 1440]); sc.render.film_transparent = False
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (0.0015, 0.0015, 0.0017, 1)
sol = bpy.data.objects.new('sol', bpy.data.lights.new('sol', 'SUN')); bpy.context.collection.objects.link(sol)
sol.data.energy = 4.6; sol.data.angle = 0.02; sol.rotation_euler = (math.radians(68), 0, math.radians(-42))
enche = bpy.data.objects.new('f', bpy.data.lights.new('f', 'SUN')); bpy.context.collection.objects.link(enche); enche.data.energy = 0.5; enche.rotation_euler = (math.radians(70), 0, math.radians(60))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); bpy.context.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'ORTHO'; q = ARGS.get('quadro', [0.5, 1.12]); cam.data.ortho_scale = H * q[1]
cam.location = (0, -40, zmin + H * q[0]); cam.rotation_euler = (math.radians(90), 0, 0)
sc.render.use_freestyle = True; vl = bpy.context.view_layer; vl.use_freestyle = True
ls = vl.freestyle_settings.linesets.new('tinta'); ls.select_silhouette = True; ls.select_border = True; ls.select_crease = True; ls.select_contour = True; ls.select_suggestive_contour = True
vl.freestyle_settings.crease_angle = math.radians(140)
ls.linestyle.thickness = ARGS.get('traco', 2.6); ls.linestyle.color = (0.02, 0.02, 0.02)
sc.render.filepath = SAIDA; bpy.ops.render.render(write_still=True); print('ok', SAIDA)
