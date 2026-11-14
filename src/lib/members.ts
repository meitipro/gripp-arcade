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

/** Robot face (SVG fragments in a 100x100 box), drawn from the handle so it never changes. */
export function robotFace(handle: string): string {
  const r = mulberry32(hashString(handle));
  const hues = ["#B56654", "#B9986A", "#7A6B5A", "#202020", "#DFD8D0"];
  const body = hues[Math.floor(r() * hues.length)];
  const eye = Math.floor(r() * 3);
  const antenna = r() > 0.5;
  const mouth = Math.floor(r() * 3);
  const ink = body === "#202020" ? "#F4F1EC" : "#202020";
  let s = `<rect x="14" y="22" width="72" height="62" rx="16" fill="${body}"/>`;
  if (antenna) s += `<rect x="48" y="8" width="4" height="16" fill="${body}"/><circle cx="50" cy="8" r="5" fill="#B9986A"/>`;
  s += eye === 0 ? `<circle cx="36" cy="50" r="7" fill="${ink}"/><circle cx="64" cy="50" r="7" fill="${ink}"/>`
    : eye === 1 ? `<rect x="28" y="44" width="16" height="12" rx="3" fill="${ink}"/><rect x="56" y="44" width="16" height="12" rx="3" fill="${ink}"/>`
    : `<rect x="26" y="48" width="20" height="5" rx="2" fill="${ink}"/><rect x="54" y="48" width="20" height="5" rx="2" fill="${ink}"/>`;
  s += mouth === 0 ? `<rect x="36" y="68" width="28" height="5" rx="2" fill="${ink}"/>`
    : mouth === 1 ? `<path d="M34 68 Q50 80 66 68" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<rect x="38" y="66" width="24" height="9" rx="3" fill="none" stroke="${ink}" stroke-width="3"/>`;
  return s;
}
