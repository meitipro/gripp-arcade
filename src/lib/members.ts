import { hashString, mulberry32, pick } from "./rng";

export const SAMPLE_HANDLES = ["mira.ops","kian_grip","servo_sara","nav.teleop","pixelpari","dadash_arm","lumi_lab","baran.bot","tara_tick","oto_actuator","nilu.nodes","rook_ro","ash.joint","zed_zero","mahsa_mesh","kuro_kit","ivy_inertia","hadi_haptic","luna_lidar","fox_frame","pari_pose","arman_axis","echo_effector","sima_sensor","dara_drive","noor_node","yuki_yaw","bob_bearing","cyra_calib","omid_orbit","rana_rail","tiko_torque","vera_vision","jun_joule","elham_edge","leo_latency","shirin_servo","kai_kinematic","roya_robo","ben_bracket","mina_motor","ali_actuate","zoe_zip","pouya_pick","dina_dock","sam_stack","nora_nudge","amir_arm","jasmine_jig","tom_track","keya_kernel","milo_mount","sahar_swarm","ravi_relay","bita_belt","hugo_hinge","yara_yield","milad_mill","ela_encoder","finn_fleet","gita_gear","owen_odom","setareh_scan","pia_pivot","reza_reach","ida_idle","taha_tool","lale_lens","arya_align","nika_node"];

const SQUAD_CODES = ["IR","GL","TR","IN","NG","ID","PH","RU","AR","BR","VN","EU"];
export interface SampleMember { handle: string; hp: number; squad: string; serial: number; streak: number; joined: string }

export function sampleMembers(): SampleMember[] {
  return SAMPLE_HANDLES.map((handle, i) => {
    const r = mulberry32(hashString(handle));
    const hp = Math.floor(Math.pow(r(), 2.2) * 22000) + 20;
    return { handle, hp, squad: pick(r, SQUAD_CODES), serial: 100 + i * 7, streak: Math.floor(r() * 30), joined: "NOV 2026" };
  });
}

/** Robot face exactly as drawn in the design canvas (64 box, scaled into our 100 box). Seeded by the handle. */
export function robotFace(handle: string): string {
  const rnd = (seed: number) => { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  let h = 7;
  for (const c of handle) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const r = rnd(h); r();
  const dark = r() < 0.35;
  const hr = 6 + Math.floor(r() * 12);
  const ew = 6 + Math.floor(r() * 7);
  const eh = r() < 0.5 ? ew + 2 : 3 + Math.floor(r() * 3);
  const gap = 6 + Math.floor(r() * 8);
  const ant = r() < 0.6;
  const ax = 20 + Math.floor(r() * 24);
  const acc = r() < 0.5 ? "#B56654" : "#B9986A";
  const bg = dark ? "#202020" : "#DFD8D0", head = dark ? "#F4F1EC" : "#202020", eye = dark ? "#202020" : "#F4F1EC";
  const ex1 = 32 - gap / 2 - ew, ex2 = 32 + gap / 2, ey = 31 - eh / 2 - 2, erx = Math.min(ew, eh) / 2;
  return `<g transform="scale(1.5625)"><rect width="64" height="64" rx="16" fill="${bg}"/>` +
    (ant ? `<circle cx="${ax}" cy="7" r="3" fill="${acc}"/>` : "") +
    `<rect x="12" y="16" width="40" height="34" rx="${hr}" fill="${head}"/>` +
    `<rect x="${ex1}" y="${ey}" width="${ew}" height="${eh}" rx="${erx}" fill="${eye}"/><rect x="${ex2}" y="${ey}" width="${ew}" height="${eh}" rx="${erx}" fill="${eye}"/></g>`;
}
