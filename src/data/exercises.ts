import { ExerciseItem } from '../types';

export const EXERCISE_LIBRARY: ExerciseItem[] = [
  // NECK
  {
    id: 'chin-tucks',
    name: 'Chin Tucks',
    category: 'neck',
    durationSec: 45,
    difficulty: 'Easy',
    targetArea: 'Deep Cervical Flexors & Neck Extensors',
    description: 'A fundamental ergonomic reset to counteract forward-head posture and screen lean.',
    instructions: [
      'Sit tall with your back against the chair and eyes looking straight ahead.',
      'Gently retract your chin straight backwards like making a double chin (do not tilt head down).',
      'Hold the retracted position for 3–5 seconds, feeling a gentle stretch at the base of the skull.',
      'Slowly release back to neutral and repeat 6–8 times.'
    ],
    recommendedConditions: ['Forward Head Posture', 'Prolonged Screen Time', 'Cervical Spine Compression'],
    seatedOnly: true,
    benefits: ['Relieves suboccipital tension', 'Aligns cervical spine over shoulders', 'Reduces neck fatigue'],
    animationType: 'chin_tucks'
  },
  {
    id: 'neck-rotation',
    name: 'Neck Rotation Flow',
    category: 'neck',
    durationSec: 45,
    difficulty: 'Easy',
    targetArea: 'Sternocleidomastoid & Splenius Capitis',
    description: 'Gentle horizontal rotation to restore cervical range of motion and relieve unilateral stiffness.',
    instructions: [
      'Drop your shoulders away from your ears and sit upright.',
      'Slowly rotate your head to look over your right shoulder until a comfortable stretch is felt.',
      'Hold for 3 seconds, keeping your chin level with the horizon.',
      'Smoothly sweep back through center and rotate to look over your left shoulder.',
      'Repeat 5 times per side smoothly without forcing.'
    ],
    recommendedConditions: ['Head Tilt Asymmetry', 'Multi-monitor Neck Strain', 'Stationary Gaze'],
    seatedOnly: true,
    benefits: ['Enhances rotational mobility', 'Loosens stiff neck muscles', 'Improves blood flow'],
    animationType: 'neck_rotation'
  },
  {
    id: 'neck-side-stretch',
    name: 'Lateral Neck Side Stretch',
    category: 'neck',
    durationSec: 60,
    difficulty: 'Easy',
    targetArea: 'Upper Trapezius & Levator Scapulae',
    description: 'Releases chronic tension along the side of the neck and top of the shoulder girdle.',
    instructions: [
      'Sit comfortably and anchor your left hand under your chair thigh.',
      'Gently lower your right ear towards your right shoulder without hiking the shoulder up.',
      'Optionally rest your right hand lightly on the left side of your head for gentle weight.',
      'Hold for 20 seconds, breathe deeply, then switch to the left side.'
    ],
    recommendedConditions: ['Shoulder Imbalance', 'Trapezius Tightness', 'Head Tilt Deviation'],
    seatedOnly: true,
    benefits: ['Decompresses upper trapezius', 'Relieves tension headache triggers', 'Evens shoulder height'],
    animationType: 'neck_side_stretch'
  },

  // SHOULDERS
  {
    id: 'shoulder-rolls',
    name: 'Shoulder Rolls & Circles',
    category: 'shoulders',
    durationSec: 40,
    difficulty: 'Easy',
    targetArea: 'Deltoids, Trapezius & Scapular Stabilizers',
    description: 'Rhythmic circular motion to restore synovial fluid and drop elevated, hunched shoulders.',
    instructions: [
      'Let your arms hang naturally by your sides.',
      'Inhale as you shrug shoulders up toward your ears.',
      'Roll them backward, pulling shoulder blades together.',
      'Exhale and slide your shoulder blades down your back.',
      'Perform 6 backward rolls, then reverse for 4 forward rolls.'
    ],
    recommendedConditions: ['Elevated Shoulders', 'Hunched Posture', 'Prolonged Typing'],
    seatedOnly: true,
    benefits: ['Releases shoulder shrugging reflex', 'Increases upper body circulation', 'Resets resting shoulder posture'],
    animationType: 'shoulder_rolls'
  },
  {
    id: 'cross-body-shoulder',
    name: 'Cross-Body Shoulder Stretch',
    category: 'shoulders',
    durationSec: 60,
    difficulty: 'Easy',
    targetArea: 'Posterior Deltoid & Infraspinatus',
    description: 'Stretches the back of the shoulder joint and rotator cuff after long periods with hands on keyboards.',
    instructions: [
      'Bring your right arm across your chest at chest height.',
      'Use your left forearm or hand to hook underneath and support your right elbow.',
      'Gently pull the right arm closer to your torso while keeping shoulders relaxed and down.',
      'Hold for 20 seconds, breathe steadily, and repeat on the opposite side.'
    ],
    recommendedConditions: ['Mouse Shoulder Fatigue', 'Keyboard Internal Rotation', 'Upper Shoulder Strain'],
    seatedOnly: true,
    benefits: ['Relieves posterior shoulder capsule stiffness', 'Balances keyboard reaching', 'Improves arm mobility'],
    animationType: 'cross_body_shoulder'
  },
  {
    id: 'shoulder-blade-squeeze',
    name: 'Scapular Squeeze & Retraction',
    category: 'shoulders',
    durationSec: 45,
    difficulty: 'Easy',
    targetArea: 'Rhomboids & Middle Trapezius',
    description: 'Strengthens postural postural retractors to pull rounded shoulders back into neutral alignment.',
    instructions: [
      'Sit tall with elbows bent at 90 degrees by your ribcage, palms facing forward.',
      'Squeeze your shoulder blades together as if holding a pencil between them.',
      'Hold the contraction firmly for 4–5 seconds while breathing smoothly.',
      'Slowly release to neutral without letting shoulders slump forward. Repeat 8 reps.'
    ],
    recommendedConditions: ['Protracted Shoulders', 'Slouching', 'Desk Hunch'],
    seatedOnly: true,
    benefits: ['Activates dormant postural muscles', 'Opens chest cavity', 'Reverses anterior shoulder roll'],
    animationType: 'shoulder_blade_squeeze'
  },

  // UPPER BACK
  {
    id: 'thoracic-extension',
    name: 'Seated Thoracic Extension',
    category: 'upper_back',
    durationSec: 50,
    difficulty: 'Easy',
    targetArea: 'Thoracic Spine & Pectoralis Major',
    description: 'Counters spinal kyphosis by extending the mid-back over the chair support.',
    instructions: [
      'Sit back firmly so your mid-back touches the chair backrest.',
      'Interlace fingers behind your head or place hands on your temples, elbows wide.',
      'Inhale and gently lean backward arching your upper back over the top of the chair.',
      'Gaze slightly upward, expand your ribcage, and hold for 3–5 seconds.',
      'Exhale back to vertical. Repeat 6 rhythmic cycles.'
    ],
    recommendedConditions: ['Slouching / Kyphosis', 'Shallow Breathing', 'Prolonged Sedentary Work'],
    seatedOnly: true,
    benefits: ['Restores thoracic extension', 'Improves lung capacity', 'Counteracts forward slump'],
    animationType: 'thoracic_extension'
  },
  {
    id: 'seated-upper-back-stretch',
    name: 'Seated Upper-Back Clasp',
    category: 'upper_back',
    durationSec: 45,
    difficulty: 'Easy',
    targetArea: 'Rhomboids, Latissimus Dorsi & Posterior Spine',
    description: 'Opens tight mid-back space and decompresses intervertebral tension.',
    instructions: [
      'Clasp your hands together in front of your chest with fingers interlaced.',
      'Push your hands forward, turning palms away from you.',
      'Tuck your chin slightly and gently round your upper back, spreading shoulder blades apart.',
      'Hold the gentle decompression for 15–20 seconds while taking deep breaths into your back.'
    ],
    recommendedConditions: ['Mid-Back Burning/Ache', 'Continuous Sitting', 'Rigid Spine'],
    seatedOnly: true,
    benefits: ['Spreads scapular muscles', 'Releases interscapular tension', 'Provides gentle spinal traction'],
    animationType: 'seated_upper_back'
  },
  {
    id: 'seated-spinal-rotation',
    name: 'Seated Spinal Twist',
    category: 'upper_back',
    durationSec: 60,
    difficulty: 'Easy',
    targetArea: 'Torso Rotators & Obliques',
    description: 'Rotational movement that lubricates facet joints throughout the thoracic and lumbar spine.',
    instructions: [
      'Sit tall with feet flat on the floor, hips pointing straight ahead.',
      'Place your right hand on the outside of your left knee and left hand on your chair back.',
      'Inhale to lengthen your spine, exhale to gently rotate your torso to the left.',
      'Hold for 15 seconds without forcing, then slowly unwind and repeat to the right.'
    ],
    recommendedConditions: ['Torso Lateral Lean', 'Spinal Stiffness', 'Prolonged Static Posture'],
    seatedOnly: true,
    benefits: ['Restores axial spinal rotation', 'Reduces lower/mid back stiffness', 'Stimulates digestive movement'],
    animationType: 'seated_spinal_twist'
  },

  // WRISTS & FOREARMS
  {
    id: 'wrist-flexor-stretch',
    name: 'Wrist & Forearm Flexor Stretch',
    category: 'wrists',
    durationSec: 45,
    difficulty: 'Easy',
    targetArea: 'Forearm Flexors & Carpal Tunnel',
    description: 'Prevents repetitive strain injury (RSI) and tendon strain from continuous typing and clicking.',
    instructions: [
      'Extend your right arm straight in front of you with elbow locked, palm facing up.',
      'Use your left hand to gently pull your right fingers down and back toward your body.',
      'Feel the stretch along the underside of your forearm and wrist.',
      'Hold for 15–20 seconds, then switch to the left arm.'
    ],
    recommendedConditions: ['Heavy Typing Load', 'Mouse Grip Fatigue', 'Stationary Wrists'],
    seatedOnly: true,
    benefits: ['Decompresses median nerve space', 'Prevents repetitive strain', 'Relieves forearm tightness'],
    animationType: 'wrist_flexor'
  },
  {
    id: 'wrist-extensor-stretch',
    name: 'Wrist Extensor Prayer Stretch',
    category: 'wrists',
    durationSec: 45,
    difficulty: 'Easy',
    targetArea: 'Forearm Extensors & Dorsal Wrist Tendons',
    description: 'Stretches the top of the forearm to balance keyboard typing ergonomics.',
    instructions: [
      'Extend your right arm forward, elbow straight, palm facing downward.',
      'Gently use your left hand to press your right knuckles downward toward the floor.',
      'Feel the stretch along the top of your wrist and forearm.',
      'Hold for 15–20 seconds and alternate sides.'
    ],
    recommendedConditions: ['Continuous Typing', 'Wrist Cocking Angle', 'Forearm Fatigue'],
    seatedOnly: true,
    benefits: ['Eases extensor tendon tightness', 'Balances wrist musculature', 'Reduces joint pressure'],
    animationType: 'wrist_extensor'
  },
  {
    id: 'wrist-circles',
    name: 'Wrist Waves & Circles',
    category: 'wrists',
    durationSec: 30,
    difficulty: 'Easy',
    targetArea: 'Carpal Joint Capsule & Tendon Sheaths',
    description: 'Dynamic rotational movement to circulate synovial fluid in the delicate wrist joint.',
    instructions: [
      'Interlock your fingers in front of your chest.',
      'Rotate your wrists together in fluid figure-8 or circular motions.',
      'Perform 10 clockwise rotations, then reverse direction for 10 counter-clockwise circles.',
      'Finish by gently shaking out your hands.'
    ],
    recommendedConditions: ['Static Wrist Posture', 'Fine-Motor Fatigue', 'Low Movement'],
    seatedOnly: true,
    benefits: ['Lubricates carpal joints', 'Flushes stagnant fluid', 'Quick 30s micro-reset'],
    animationType: 'wrist_circles'
  },

  // LEGS & LOWER BODY
  {
    id: 'seated-leg-extension',
    name: 'Seated Leg Extension & Hold',
    category: 'legs',
    durationSec: 45,
    difficulty: 'Easy',
    targetArea: 'Quadriceps & Knee Joint',
    description: 'Activates leg muscles and unbends knee joints compressed during prolonged sitting.',
    instructions: [
      'Sit upright in your chair with feet flat on the floor.',
      'Extend your right leg straight out in front of you until knee is straight.',
      'Flex your toes back toward your shin and hold for 5 seconds, engaging your quad.',
      'Lower under control and switch to the left leg. Alternate for 6 reps per leg.'
    ],
    recommendedConditions: ['Prolonged Stationary Sitting', 'Sluggish Lower Body Circulation'],
    seatedOnly: true,
    benefits: ['Activates lower limbs', 'Promotes blood return from legs', 'Relieves bent knee pressure'],
    animationType: 'seated_leg_extension'
  },
  {
    id: 'calf-raises',
    name: 'Seated / Standing Calf Pumps',
    category: 'legs',
    durationSec: 40,
    difficulty: 'Easy',
    targetArea: 'Gastrocnemius & Soleus (Secondary Heart)',
    description: 'Pumps the calf muscles to stimulate venous blood return and prevent lower-leg stagnation.',
    instructions: [
      'Place feet flat on the floor shoulder-width apart (seated or standing).',
      'Press firmly through your toes to lift your heels as high as possible.',
      'Pause at the peak for 1 second, feeling the calf engagement.',
      'Slowly lower heels back to the ground and lift your toes (tibialis pump). Repeat 15 times.'
    ],
    recommendedConditions: ['Stationary > 30 Mins', 'Heavy Legs / Swelling', 'Low Physical Movement'],
    seatedOnly: false,
    benefits: ['Boosts systemic circulation', 'Prevents venous pooling in lower extremities', 'Energizes body'],
    animationType: 'calf_raises'
  },
  {
    id: 'ankle-circles',
    name: 'Ankle Mobility Circles',
    category: 'legs',
    durationSec: 35,
    difficulty: 'Easy',
    targetArea: 'Ankle Joint & Foot Arches',
    description: 'Quick seated ankle articulation to keep lower joints free from stiffness.',
    instructions: [
      'Lift your right foot a few inches off the floor.',
      'Draw large, slow circles with your big toe, moving through full ankle range.',
      'Complete 8 rotations outward, then 8 rotations inward.',
      'Switch to the left foot and repeat.'
    ],
    recommendedConditions: ['Sedentary Desk Time', 'Ankle Rigidity', 'Stationary Work'],
    seatedOnly: true,
    benefits: ['Maintains ankle range of motion', 'Improves foot circulation', 'Relieves pedal stiffness'],
    animationType: 'ankle_circles'
  },

  // GENERAL MOBILITY
  {
    id: 'seated-march',
    name: 'Dynamic Seated March',
    category: 'mobility',
    durationSec: 50,
    difficulty: 'Easy',
    targetArea: 'Hip Flexors, Core & Cardiovascular',
    description: 'Elevates heart rate slightly and activates deep hip flexors to awaken a stationary body.',
    instructions: [
      'Sit near the front edge of your chair with an engaged core and straight spine.',
      'March in place by lifting your right knee high, swinging your left arm forward.',
      'Switch smoothly, lifting your left knee and swinging right arm.',
      'Maintain a brisk, steady rhythm for 45 seconds while breathing rhythmically.'
    ],
    recommendedConditions: ['Stationary > 30 Mins', 'Mental Slump / Drowsiness', 'Low Activity Score'],
    seatedOnly: true,
    benefits: ['Awakens nervous system', 'Increases metabolic rate', 'Releases tight hip flexor hold'],
    animationType: 'seated_march'
  },
  {
    id: 'overhead-arm-reach',
    name: 'Full-Body Overhead Reach & Side Arc',
    category: 'mobility',
    durationSec: 45,
    difficulty: 'Easy',
    targetArea: 'Latissimus, Intercostals & Spine',
    description: 'Expands the entire upper torso and lengthens the spine after prolonged gravitational compression.',
    instructions: [
      'Interlock your fingers and press your palms up toward the ceiling.',
      'Straighten your elbows and reach as high as possible, lengthening your spine.',
      'Gently lean 10 degrees to the right, holding for 3 deep breaths.',
      'Return to center, reach up again, and lean 10 degrees to the left.'
    ],
    recommendedConditions: ['Slouching', 'Spinal Compression', 'Continuous Sitting'],
    seatedOnly: false,
    benefits: ['Decompresses vertebrae', 'Stretches side body and ribs', 'Invigorates mental focus'],
    animationType: 'overhead_arm_reach'
  },
  {
    id: 'mobility-reset',
    name: 'Full-Body 90s Ergonomic Reset',
    category: 'mobility',
    durationSec: 90,
    difficulty: 'Medium',
    targetArea: 'Whole Body (Neck, Torso, Hips, Shoulders)',
    description: 'The premier comprehensive reset combining shoulder rolls, thoracic opening, and torso twists.',
    instructions: [
      '0:00–0:20: Roll shoulders backward 5 times, then forward 5 times.',
      '0:20–0:45: Interlace hands behind head and perform 4 thoracic extensions.',
      '0:45–1:10: Gentle seated spinal twist left for 10s, then right for 10s.',
      '1:10–1:30: Overhead reach with 3 deep belly breaths.'
    ],
    recommendedConditions: ['Stationary > 45 Mins', 'General Fatigue', 'Multiple Posture Warnings'],
    seatedOnly: true,
    benefits: ['Complete postural reset', 'Systemic reset across all major joints', 'Immediate energy boost'],
    animationType: 'mobility_reset'
  },

  // VISUAL BREAKS
  {
    id: 'distance-focus-2020',
    name: '20-20-20 Distance Focus',
    category: 'visual',
    durationSec: 30,
    difficulty: 'Easy',
    targetArea: 'Ciliary Eye Muscles',
    description: 'The golden ergonomic standard for reducing digital eye strain (asthenopia).',
    instructions: [
      'Look away from your computer screen, phone, and indoor reflections.',
      'Fix your gaze on an object at least 20 feet (6 meters) away (out a window is best).',
      'Relax your facial muscles and soften your gaze on the distant object.',
      'Hold your distant focus for 20–30 seconds while breathing calmly.'
    ],
    recommendedConditions: ['Screen Exposure > 40 Mins', 'Eye Fatigue', 'Tunnel Vision'],
    seatedOnly: true,
    benefits: ['Relaxes ciliary eye muscles', 'Prevents screen-induced myopia spasm', 'Calms visual cortex'],
    animationType: 'distance_focus'
  },
  {
    id: 'blink-reset',
    name: 'Blink Rate & Tear Film Reset',
    category: 'visual',
    durationSec: 30,
    difficulty: 'Easy',
    targetArea: 'Meibomian Glands & Tear Film',
    description: 'Desktop users blink 60% less frequently. This conscious blinking routine rehydrates the cornea.',
    instructions: [
      'Close your eyes gently and hold closed for 2 full seconds.',
      'Open your eyes normally for 2 seconds.',
      'Close eyes gently again, then gently squeeze your eyelids together for 2 seconds to activate oil glands.',
      'Open eyes and perform 5 rapid, gentle blinks. Repeat the cycle 3 times.'
    ],
    recommendedConditions: ['Dry Eyes', 'Prolonged Screen Stare', 'Burning / Gritty Sensation'],
    seatedOnly: true,
    benefits: ['Restores corneal tear film', 'Stimulates lipid secretions', 'Prevents dry eye syndrome'],
    animationType: 'blink_reset'
  },
  {
    id: 'palming-relaxation',
    name: 'Eye Palming Deep Relaxation',
    category: 'visual',
    durationSec: 45,
    difficulty: 'Easy',
    targetArea: 'Optic Nerve & Facial Musculature',
    description: 'Total light deprivation and soothing palm warmth to deeply rest overworked photoreceptors.',
    instructions: [
      'Vigorously rub your palms together for 10 seconds until they feel warm.',
      'Cup your warm palms gently over your closed eyes (do not apply pressure on eyeballs).',
      'Rest your elbows on your desk and let all ambient light be blocked out.',
      'Breathe deeply in total darkness for 30 seconds, visualizing a calm black void.'
    ],
    recommendedConditions: ['High Screen Load', 'Visual Overstimulation', 'Headache / Tension'],
    seatedOnly: true,
    benefits: ['Rests retinal photoreceptors', 'Thermal comfort to orbital muscles', 'Rapid parasympathetic nervous reset'],
    animationType: 'palming_relaxation'
  }
];
