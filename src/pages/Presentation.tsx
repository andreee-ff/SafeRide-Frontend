import React, { useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { CalendarDays, Share2, MapPin, Plus, ArrowRight, Navigation, Bike } from 'lucide-react';

const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-20% 0px -20% 0px" });

    return (
        <section ref={ref} className={`min-h-screen flex flex-col justify-center presentation-section ${className}`}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </section>
    );
};

const Presentation: React.FC = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.2]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroBlur = useTransform(scrollYProgress, [0, 0.3], ["blur(2px)", "blur(12px)"]); // Dynamic Blur
    
    // Kiosk Mode Logic
    const [searchParams] = useSearchParams();
    const isKiosk = searchParams.get('kiosk') === 'true';

    React.useEffect(() => {
        if (!isKiosk) return;

        console.log("Kiosk Mode Active");
        const interval = setInterval(() => {
            const sections = document.querySelectorAll('.presentation-section');
            if (sections.length === 0) return;

            // Find current section based on center point
            const viewportCenter = window.scrollY + window.innerHeight / 2;
            let currentSectionIndex = 0;
            let minDistance = Infinity;

            sections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                // Get absolute top relative to document
                const sectionTop = rect.top + window.scrollY;
                const sectionCenter = sectionTop + rect.height / 2;
                
                const distance = Math.abs(sectionCenter - viewportCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    currentSectionIndex = index;
                }
            });

            console.log("Current Section:", currentSectionIndex, "Total:", sections.length);

            let nextIndex = currentSectionIndex + 1;
            
            // Loop back if at end
            if (nextIndex >= sections.length) {
                nextIndex = 0;
            }

            // Scroll to next
            const nextSection = sections[nextIndex];
            if (nextSection) {
                const rect = nextSection.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                
                window.scrollTo({
                    top: absoluteTop,
                    behavior: 'smooth'
                });
            }

        }, 4000); // 4 seconds for faster feedback

        return () => clearInterval(interval);
    }, [isKiosk]);


    // Parallax Speeds for Bubbles
    const yBubble1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const yBubble2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
    const yBubble3 = useTransform(scrollYProgress, [0, 1], [0, -200]);

    // 0. HERO SECTION
    const Hero = () => (
        <div className="relative h-screen flex items-center justify-center overflow-hidden bg-white presentation-section">
            <motion.div style={{ scale: heroScale, opacity: heroOpacity, filter: heroBlur }} className="absolute inset-0 z-0">
                <img src="/assets/presentation_hero_v21.png" alt="Hero" className="w-full h-full object-cover scale-105" />
                <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
            </motion.div>
            
            {/* Parallax Rider Bubbles */}
            <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                {/* Bubble 1: The Hedgehog */}
                <motion.div 
                    style={{ y: yBubble1 }} 
                    className="absolute top-1/4 left-[15%] md:left-[25%] bg-white/10 backdrop-blur-md p-2 pl-3 pr-4 rounded-full border border-white/20 flex items-center gap-3 shadow-2xl"
                    initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 1 }}
                >
                    <div className="w-10 h-10 rounded-full border-2 border-green-400 overflow-hidden bg-white">
                        <img src="/assets/pain_lost_hedgehog.png" alt="Hedgehog" className="w-full h-full object-cover scale-150" />
                    </div>
                    <div className="text-left">
                        <div className="text-white text-xs font-bold">Sonic</div>
                        <div className="text-green-300 text-xs font-mono">24 km/h</div>
                    </div>
                </motion.div>

                {/* Bubble 2: Sarah */}
                <motion.div 
                    style={{ y: yBubble2 }} 
                    className="absolute bottom-1/3 right-[10%] md:right-[20%] bg-white/10 backdrop-blur-md p-2 pl-3 pr-4 rounded-full border border-white/20 flex items-center gap-3 shadow-2xl"
                    initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 1 }}
                >
                     <div className="w-10 h-10 rounded-full border-2 border-blue-400 flex items-center justify-center bg-blue-600 text-white font-bold text-sm">
                        SJ
                    </div>
                    <div className="text-left">
                        <div className="text-white text-xs font-bold">Sarah</div>
                        <div className="text-blue-300 text-xs font-mono">22 km/h</div>
                    </div>
                </motion.div>

                 {/* Bubble 3: Mike */}
                 <motion.div 
                    style={{ y: yBubble3 }} 
                    className="absolute top-1/3 right-[25%] md:right-[15%] bg-white/5 backdrop-blur-sm p-2 pl-3 pr-4 rounded-full border border-white/10 flex items-center gap-3 shadow-xl opacity-80 scale-90"
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.8, scale: 0.9 }} transition={{ delay: 1.4, duration: 1 }}
                >
                     <div className="w-8 h-8 rounded-full border-2 border-orange-400 flex items-center justify-center bg-orange-600 text-white font-bold text-xs">
                        MJ
                    </div>
                    <div className="text-left">
                        <div className="text-white text-[10px] font-bold">Mike</div>
                        <div className="text-orange-300 text-[10px] font-mono">18 km/h</div>
                    </div>
                </motion.div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="relative z-20 text-center text-white p-12 max-w-4xl rounded-3xl backdrop-blur-sm bg-black/10 border border-white/10 shadow-2xl"
            >
                <div className="flex justify-center items-center gap-4 md:gap-8 mb-6">
                    <Bike className="w-20 h-20 md:w-32 md:h-32 text-white drop-shadow-2xl" />
                    <h1 className="text-8xl md:text-9xl font-semibold tracking-tighter drop-shadow-2xl text-white pb-2 pr-4">
                        SafeRide
                    </h1>
                </div>
                <p className="text-3xl md:text-4xl font-light mb-8 tracking-wide text-blue-50 drop-shadow-md">
                    Real-time coordination for group cycling
                </p>
                <p className="text-xl text-white/90 font-light tracking-widest uppercase inline-block px-6 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
                    No one gets lost. Everyone arrives together.
                </p>
            </motion.div>
        </div>
    );

    // 1. PAIN POINTS
    const PainPoints = () => (
        <Section className="relative overflow-hidden">
             {/* Subtle background blob */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
                <h2 className="text-4xl font-light text-center mb-16 text-slate-400 uppercase tracking-widest">The Problem</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { title: "People get lost", img: "/assets/pain_lost_hedgehog.png", desc: "Where did everyone go?" },
                        { title: "Accidents go unnoticed", img: "/assets/pain_accident_unnoticed.png", desc: "Safety incidents happen in silence." },
                        { title: "Organizers lose control", img: "/assets/pain_organizer_empty.png", desc: "Leading a ghost group is stressful." }
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2, duration: 0.8 }}
                            className="bg-white/5 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-white/10"
                        >
                            <div className="h-64 flex items-center justify-center mb-6 overflow-hidden rounded-2xl bg-black/20 border border-white/5">
                                <img src={item.img} alt={item.title} className="w-full h-full object-cover transform scale-105 opacity-90" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-slate-400">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    );
    


    // 3. SOLUTION & TRANSITION MERGED
    const Solution = () => (
        <Section className="bg-slate-900 text-white relative overflow-hidden py-32">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900 to-blue-900/20 pointer-events-none"></div>
            <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col gap-24">
                
                {/* Part A: The Hook */}
                <div className="text-center">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter leading-none drop-shadow-lg mb-8 text-white relative z-20"
                    >
                        Chaos, solved.
                    </motion.h2>
                </div>

                {/* Part B: The Reveal */}
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 text-left relative z-20">
                         <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px]"></div>
                        
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-slate-400 uppercase tracking-widest relative z-10">Meet</h3>
                        <div className="flex items-center gap-4 mb-8 relative z-10 pl-4">
                            <Bike className="w-16 h-16 md:w-24 md:h-24 text-primary-500" />
                            <h3 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400 pb-2 pr-4">
                                SafeRide
                            </h3>
                        </div>
                        
                        <div className="mt-12 mb-8">
                            <h4 className="text-4xl md:text-5xl font-black leading-tight text-white/90">
                                One Map.<br/>
                                Every Rider.<br/>
                                <span className="text-blue-500">Live.</span>
                            </h4>
                        </div>

                        <p className="text-xl text-slate-300 leading-relaxed relative z-10 max-w-lg">
                            Experience the Swarm. Watch as independent riders become a coordinated team in real-time. No more guessing. No more stops.
                        </p>
                    </div>
                    
                    {/* Visual: Radar Pulse Animation */}
                    <div className="flex-1 relative flex items-center justify-center h-[500px]">
                        {/* Core Rider */}
                        <div className="w-4 h-4 bg-white rounded-full z-20 shadow-[0_0_20px_rgba(255,255,255,1)]"></div>
                        
                        {/* Pulse Rings */}
                        {[1, 2, 3].map((i) => (
                             <motion.div
                                key={i}
                                className="absolute border border-primary-500/50 rounded-full"
                                initial={{ width: 0, height: 0, opacity: 1 }}
                                animate={{ width: "100%", height: "100%", opacity: 0 }}
                                transition={{ 
                                    duration: 3, 
                                    repeat: Infinity, 
                                    delay: i * 0.8,
                                    ease: "easeOut"
                                }}
                            />
                        ))}

                        {/* Connected Peers (Orbiting) */}
                        {[1, 2, 3, 4].map((i) => (
                             <motion.div
                                key={`peer-${i}`}
                                className="absolute w-full h-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                            >
                                <div 
                                    className="w-3 h-3 bg-secondary-400 rounded-full absolute shadow-[0_0_10px_rgba(232,121,249,0.8)]"
                                    style={{ top: '50%', left: `${20 + i * 15}%` }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </Section>
    );



    // 4. HOW IT WORKS
    // 4. HOW IT WORKS
    const HowItWorks = () => (
        <Section className="relative overflow-hidden">
             {/* Light "Aurora" Background - Static for performance */}
             <div className="absolute inset-0 bg-white"></div>
             <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-200/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
             <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-200/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

             <div className="max-w-7xl mx-auto px-6 w-full text-center relative z-10">
                <h2 className="text-4xl font-light text-slate-800 mb-24 uppercase tracking-widest drop-shadow-sm">How It Works</h2>
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative">
                    {/* Connecting Line (Desktop) - Gradient */}
                    <div className="hidden md:block absolute top-[3.5rem] left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-red-200 opacity-50 -z-0 rounded-full"></div>

                    {[
                        { 
                            step: "01", 
                            label: "Create Ride",
                            desc: "Set the route and time in seconds.", 
                            icon: <CalendarDays className="w-8 h-8 text-blue-600"/>, 
                            border: "border-blue-200",
                            shadow: "shadow-blue-200/50",
                            button: (
                                <div className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1">
                                    <Plus className="w-6 h-6" /> Create Ride
                                </div>
                            )
                        },
                        { 
                            step: "02", 
                            label: "Share Code",
                            desc: "Send the unique link to your group.", 
                            icon: <Share2 className="w-8 h-8 text-purple-600"/>, 
                            border: "border-purple-200",
                            shadow: "shadow-purple-200/50",
                            button: (
                                <div className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg shadow-md hover:border-purple-300 hover:shadow-lg transition-all transform hover:-translate-y-1">
                                    Share Code <ArrowRight className="w-6 h-6" />
                                </div>
                            )
                        },
                        { 
                            step: "03", 
                            label: "See Live",
                            desc: "Track every rider on one map.", 
                            icon: <MapPin className="w-8 h-8 text-red-600"/>, 
                            border: "border-red-200",
                            shadow: "shadow-red-200/50",
                            button: (
                                <div className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg shadow-md hover:border-red-300 hover:shadow-lg transition-all transform hover:-translate-y-1">
                                    <Navigation className="w-6 h-6" /> See Live
                                </div>
                            )
                        }
                    ].map((s, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="relative z-10 flex-1 w-full"
                        >
                             <div className={`w-28 h-28 bg-white/80 backdrop-blur-md ${s.border} border-2 rounded-full flex items-center justify-center mb-8 mx-auto shadow-xl ${s.shadow}`}>
                                {s.icon}
                            </div>
                            
                            <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/40 ring-1 ring-white/60 hover:shadow-2xl transition-all duration-300 flex flex-col items-center group">
                                <span className="text-sm font-bold text-slate-400 mb-4 block tracking-widest uppercase">{s.step}</span>
                                <div className="mb-6 opacity-100 transform transition-transform">
                                    {s.button}
                                </div>
                                <p className="text-slate-600 leading-relaxed font-medium group-hover:text-slate-800 transition-colors">{s.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
             </div>
        </Section>
    );

    // 5. CORE FEATURES (Formerly The Solution/Values)
    const CoreFeatures = () => (
         <Section className="relative overflow-hidden">
             {/* Background blobs to match PainPoints style */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
             
            <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
                <h2 className="text-4xl font-light text-center mb-16 text-slate-400 uppercase tracking-widest">Key Features</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { 
                            title: "Real-time Visibility", 
                            img: "/assets/Gemini_Generated_Real-time_Visibility.png", 
                            desc: "\"Never lose a rider. See everyone on the live map.\"",
                            titleColor: "text-white"
                        },
                        { 
                            title: "Proactive Safety", 
                            img: "/assets/Gemini_Generated_Proactive_Safety.png", 
                            desc: "\"Spot stops immediately. Know when to help.\"",
                            titleColor: "text-green-400"
                        },
                        { 
                            title: "Smart Coordination", 
                            img: "/assets/Gemini_Generated_Smart_Coordination.png", 
                            desc: "\"Manage the pack flow effortlessly.\"",
                            titleColor: "text-blue-400"
                        }
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2, duration: 0.8 }}
                            className="bg-white/5 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-white/10 group cursor-default"
                        >
                            <div className="aspect-square w-full mb-6 flex items-center justify-center rounded-2xl bg-black/20 border border-white/5 overflow-hidden relative shadow-inner p-8">
                                <img src={item.img} alt={item.title} className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700" />
                            </div>
                            <h3 className={`text-3xl font-bold mb-4 ${item.titleColor}`}>{item.title}</h3>
                            <p className="text-lg text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    );

    // 7. FUTURE IMPROVEMENTS (Formerly Feature Spotlight)
    const FutureImprovements = () => (
        <Section className="bg-slate-900 text-white py-32 overflow-hidden relative">
             <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col gap-32">
                
                <div className="text-center mb-12">
                     <h2 className="text-5xl font-light tracking-tight text-white mb-4">Coming Soon</h2>
                     <p className="text-slate-400">The roadmap to the ultimate riding experience.</p>
                </div>

                {/* Feature 1: Safety Alert (Future) */}
                <div className="flex flex-col md:flex-row items-center gap-16 presentation-section">
                    <div className="flex-1 order-2 md:order-1">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl transform scale-90"></div>
                            <img src="/assets/feature_safety_alert.png" alt="Safety Alert" className="w-full relative z-10 rounded-2xl shadow-2xl border border-white/10" />
                        </motion.div>
                    </div>
                    <div className="flex-1 order-1 md:order-2 text-left">
                        <div className="w-16 h-1 bg-red-500 mb-6 rounded-full"></div>
                        <h3 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                            Panic? <br/>
                            <span className="text-red-500">Not anymore.</span>
                        </h3>
                        <p className="text-xl text-slate-300 leading-relaxed mb-6">
                            When a rider creates an alert, the organizer knows instantly. 
                            The map highlights the danger zone, and the interface pulses red.
                        </p>
                        <ul className="space-y-4">
                             {[
                                "Precise GPS location of the incident",
                                "Instant visual feedback for the leader",
                                "One-tap emergency routing"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Feature 2: Competitions (Gamification) */}
                <div className="flex flex-col md:flex-row items-center gap-16 presentation-section">
                     <div className="flex-1 text-left">
                        <div className="w-16 h-1 bg-orange-500 mb-6 rounded-full"></div>
                         <h3 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                            Ride as One<br/>
                            <span className="text-orange-400">Compete as Many</span>
                        </h3>
                         <p className="text-xl text-slate-300 leading-relaxed mb-6">
                            Earn badges, track your stats, and challenge your friends.
                            Gamification makes every ride an adventure.
                        </p>
                         <ul className="space-y-4">
                             {[
                                "Leaderboards & Achievements",
                                "Community Badges",
                                "Ride History Stats"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1">
                        <motion.div 
                             initial={{ opacity: 0, x: 50 }}
                             whileInView={{ opacity: 1, x: 0 }}
                             transition={{ duration: 0.8 }}
                             className="relative"
                        >
                             <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-3xl transform scale-90"></div>
                            <img src="/assets/feature_gamification.png" alt="Swarm" className="w-full relative z-10 rounded-2xl shadow-2xl border border-white/10" />
                        </motion.div>
                    </div>
                </div>

                {/* Feature List */}


             </div>
        </Section>
    );

    // 8. FUTURE & CLOSING
    const FutureAndClosing = () => (
        <Section className="relative bg-black text-white overflow-hidden">
             <div className="absolute inset-0 z-0">
                <img src="/assets/sunset_riders.png" alt="Sunset" className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center h-full flex flex-col justify-center">
                <div className="mb-32 backdrop-blur-md bg-black/30 p-12 rounded-3xl border border-white/10">
                    <h3 className="text-4xl md:text-5xl font-light mb-12 text-gray-200">And this is only the beginning.</h3>
                    <div className="flex flex-wrap justify-center gap-6 text-white font-medium">
                        {[
                            "Distance Analytics", "Mobile App", "Route History", 
                            "Heated Map", "SOS Alerts", "In-Ride Chat", 
                            "Push Notifications", "Community Badges"
                        ].map((f, i) => (
                            <span key={i} className="px-6 py-2 bg-white/10 rounded-full text-sm uppercase tracking-wide border border-white/20 hover:bg-white/20 transition-colors cursor-default">
                                {f}
                            </span>
                        ))}
                    </div>

                </div>

                <div>
                    <h2 className="text-7xl md:text-9xl font-bold mb-6 tracking-tight">SafeRide</h2>
                    <p className="text-2xl font-light text-gray-300 mb-12 max-w-xl mx-auto">Because every rider matters</p>
                    <div className="flex justify-center gap-6">
                         <button onClick={() => navigate('/nodes')} className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-medium transition-colors border border-white/20">
                            Technical Documentation
                        </button>
                    </div>
                </div>
            </div>
        </Section>
    );

    return (
        <main className="font-sans selection:bg-blue-500 selection:text-white bg-gradient-to-b from-slate-900 via-slate-900 to-black">
            <Hero />
            <PainPoints />
            <Solution />
            <CoreFeatures />
            <HowItWorks />
            <FutureImprovements />
            <FutureAndClosing />
        </main>
    );
};

export default Presentation;
