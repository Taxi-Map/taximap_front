import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin, ShieldCheck, ArrowRight, Navigation, Wallet,
    AlertCircle, CheckCircle2, Globe2, Star, ChevronDown
} from 'lucide-react';
import { Header } from './Header';
import { MapComponent } from './MapComponent';
import Loader from './Loader';
import SearchInput from './SearchInput';

function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const { ref, isVisible } = useScrollReveal();
    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
        >
            {children}
        </div>
    );
}

export default function LandingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/map?destination=${encodeURIComponent(searchQuery)}`);
    };

    if (isInitialLoading) return <Loader />;

    return (
        <div className="min-h-screen bg-sand overflow-x-hidden selection:bg-blue-sky/30 selection:text-blue-deep">
            <Header />

            {/* Hero Section */}
            <section className="relative w-full flex items-center min-h-[100dvh] pt-20 pb-10 lg:py-0 overflow-hidden">
                <div className="absolute inset-0 z-0 w-full h-full">
                    <MapComponent />
                    <div className="absolute inset-0 bg-blue-deep/50 backdrop-blur-[1px] z-[5]" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-deep via-blue-deep/40 to-transparent z-[6]" />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-deep to-transparent z-[6]" />
                </div>

                <div className="hidden lg:block absolute top-0 right-0 z-10 animate-in fade-in slide-in-from-right-12 duration-1000">
                    <img src="/img/taxi_azul.png" alt="Taxi Azul" className="w-68 xl:w-74 drop-shadow-2xl" />
                </div>

                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="max-w-4xl space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000 w-full">
                            <div className="space-y-4 lg:space-y-6">
                                <div className="space-y-2 lg:space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-blue-atlantic rounded-2xl flex items-center justify-center shadow-lg shadow-blue-atlantic/40">
                                            <Navigation className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                        </div>
                                        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white leading-none tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                                            TAXI MAP
                                        </h1>
                                    </div>
                                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-blue-sky font-bold leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                        A forma mais simples, segura e inteligente de te moveres em Luanda
                                    </p>
                                </div>
                                <p className="text-slate-100 text-lg sm:text-xl md:text-2xl font-medium max-w-3xl leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    Mover-se em Luanda pode ser confuso e demorado. O Taxi Map ajuda-te a escolher o táxi certo e seguir a rota correta usando o mapa da cidade como guia.
                                </p>
                            </div>
                            <div className="mt-8 lg:mt-12 flex w-full">
                                <SearchInput
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    onSubmit={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
                                    loading={false}
                                    placeholder="Para onde vais?"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <RevealSection>
                <section id="sobre" className="py-16 lg:py-32 bg-white relative z-20 shadow-[0_-20px_50px_rgba(10,22,40,0.15)] rounded-t-[3rem] lg:rounded-t-[4rem]">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center mb-12 lg:mb-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 lg:w-28 lg:h-28 bg-blue-horizon/20 rounded-[2rem] mb-8 lg:mb-10">
                            <img src="/img/taxi.png" alt="Taxi" className="w-12 h-12 lg:w-18 lg:h-18" />
                        </div>
                        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl text-blue-deep mb-6 lg:mb-10 leading-none tracking-tight">O QUE É O TAXI MAP?</h2>
                        <p className="text-lg sm:text-xl lg:text-2xl text-slate-mid max-w-4xl mx-auto leading-relaxed font-medium">
                            O Taxi Map é uma plataforma digital que ajuda cidadãos e visitantes a escolher o táxi certo, seguir a rota correta e chegar ao destino com mais eficiência e segurança, usando o mapa da cidade como guia.
                        </p>
                        <div className="mt-6 inline-block bg-blue-horizon/20 text-blue-atlantic px-6 py-3 rounded-xl font-bold text-lg">
                            Tudo pensado para a realidade dos candongueiros de Luanda.
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                        {[
                            { icon: <MapPin className="w-8 h-8 lg:w-10 lg:h-10" />, color: 'text-blue-atlantic bg-blue-horizon/20', title: "Localização", desc: "Ver no mapa quais táxis passam perto de ti" },
                            { icon: <Navigation className="w-8 h-8 lg:w-10 lg:h-10" />, color: 'text-emerald-600 bg-emerald-100', title: "Confirmação", desc: "Confirmar se estás na rota correta em tempo real" },
                            { icon: <Wallet className="w-8 h-8 lg:w-10 lg:h-10" />, color: 'text-amber-dark bg-amber-light', title: "Economia", desc: "Comparar rotas mais rápidas e mais económicas" },
                            { icon: <ShieldCheck className="w-8 h-8 lg:w-10 lg:h-10" />, color: 'text-rose-600 bg-rose-100', title: "Segurança", desc: "Sentir-te seguro ao saber onde estás e para onde vais" },
                        ].map((item, idx) => (
                            <div key={idx} className="group p-8 lg:p-12 bg-sand rounded-[2.5rem] lg:rounded-[3rem] hover:bg-white hover:shadow-card-hover transition-all duration-500 border-2 border-transparent hover:border-blue-sky/30 text-center flex flex-col items-center">
                                <div className={`mb-6 lg:mb-8 transform group-hover:scale-125 transition-transform duration-500 p-4 bg-white rounded-2xl shadow-sm ${item.color.split(' ')[0]}`}>
                                    <div className={item.color.split(' ')[0]}>
                                        {item.icon}
                                    </div>
                                </div>
                                <h3 className="font-display text-2xl lg:text-3xl text-blue-deep mb-3 lg:mb-4 tracking-wide">{item.title}</h3>
                                <p className="text-slate-mid text-base lg:text-lg font-medium leading-snug">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </RevealSection>

            {/* Pain Points Section */}
            <RevealSection>
                <section className="py-16 lg:py-32 bg-blue-deep text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-amber-warm/10 blur-[100px] lg:blur-[150px] rounded-full" />
                    <div className="absolute bottom-0 left-0 -translate-y-1/3 -translate-x-1/3 w-[200px] lg:w-[400px] h-[200px] lg:h-[400px] bg-blue-sky/10 blur-[100px] lg:blur-[120px] rounded-full" />
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                            <div className="space-y-8 lg:space-y-14">
                                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-none tracking-tight">TENS ALGUMA DESTAS DÚVIDAS?</h2>
                                <div className="space-y-4 lg:space-y-8">
                                    {[
                                        "Não sabes qual táxi pegar para chegar ao teu destino?",
                                        "Ficas inseguro se o táxi que apanhaste está mesmo a seguir a rota certa?",
                                        "Queres saber qual o caminho mais económico até onde precisas de ir?",
                                        "Gostarias de viajar com pessoas que vão para o mesmo destino que tu?"
                                    ].map((q, idx) => (
                                        <div key={idx} className="flex gap-4 lg:gap-8 items-start bg-white/5 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all duration-300">
                                            <AlertCircle className="w-8 h-8 lg:w-10 lg:h-10 text-blue-sky shrink-0" />
                                            <p className="text-lg lg:text-2xl font-bold leading-tight">{q}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="inline-flex items-center gap-4 lg:gap-6 bg-amber-warm text-blue-deep px-8 py-4 lg:px-10 lg:py-5 rounded-full font-bold text-xl lg:text-2xl shadow-2xl hover:scale-105 transition-transform cursor-pointer">
                                    <ArrowRight className="w-6 h-6 lg:w-8 lg:h-8" />
                                    O Taxi Map foi criado exatamente para ti.
                                </div>
                            </div>
                            <div className="relative group hidden lg:block">
                                <div className="absolute -inset-6 bg-amber-warm/10 rounded-[4rem] blur-3xl group-hover:bg-amber-warm/20 transition-all" />
                                <img src="img/unnamed.webp" alt="Luanda Traffic" className="relative rounded-[4rem] shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-1000 object-cover aspect-[4/5] w-full" />
                            </div>
                        </div>
                    </div>
                </section>
            </RevealSection>

            {/* Vantagens Section */}
            <RevealSection>
                <section id="vantagens" className="py-16 lg:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-12 lg:mb-24 space-y-4 lg:space-y-6">
                            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-blue-deep leading-none tracking-tight">PENSADO PARA A REALIDADE DE LUANDA</h2>
                            <p className="text-lg lg:text-2xl text-slate-mid font-medium max-w-3xl mx-auto">O Taxi Map não é um app genérico. Ele é construído com base em:</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                            {[
                                { title: "ROTAS REAIS", desc: "Baseado nas rotas dos candongueiros" },
                                { title: "PARAGENS INFORMAIS", desc: "Conhecimento das paragens diárias" },
                                { title: "FLUXOS DA CIDADE", desc: "Entendimento do tráfego local" },
                                { title: "EXPERIÊNCIA REAL", desc: "Quem vive Luanda todos os dias" }
                            ].map((item, idx) => (
                                <div key={idx} className="group p-8 lg:p-12 bg-sand border-2 border-transparent rounded-[2.5rem] lg:rounded-[3rem] hover:border-blue-sky hover:bg-white hover:shadow-card-hover transition-all duration-300 text-center">
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-atlantic text-white rounded-3xl flex items-center justify-center font-display text-3xl lg:text-4xl mb-6 lg:mb-10 shadow-xl mx-auto group-hover:scale-110 transition-transform duration-300">
                                        {idx + 1}
                                    </div>
                                    <h4 className="font-display text-2xl lg:text-3xl text-blue-deep mb-3 lg:mb-4 tracking-wide">{item.title}</h4>
                                    <p className="text-slate-mid text-base lg:text-lg font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 lg:mt-24 text-center">
                            <p className="text-xl lg:text-3xl font-bold italic text-white bg-blue-atlantic inline-block px-8 py-4 lg:px-12 lg:py-6 rounded-[2rem] shadow-xl rotate-[-1deg]">
                                "Tecnologia ao serviço das pessoas, não o contrário."
                            </p>
                        </div>
                    </div>
                </section>
            </RevealSection>

            {/* Impact Section */}
            <RevealSection>
                <section id="impacto" className="py-16 lg:py-32 bg-sand">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="bg-blue-deep rounded-[3rem] lg:rounded-[5rem] p-8 sm:p-16 lg:p-28 text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(10,22,40,0.5)]">
                            <Globe2 className="absolute -bottom-12 -right-12 lg:-bottom-24 lg:-right-24 w-[250px] lg:w-[500px] h-[250px] lg:h-[500px] text-white/5 rotate-12" />
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-atlantic/10 to-transparent" />
                            <div className="relative z-10 max-w-5xl">
                                <h2 className="font-display text-4xl sm:text-5xl lg:text-7xl text-white mb-8 lg:mb-12 leading-none tracking-tight">IMPACTO SOCIAL</h2>
                                <p className="text-xl lg:text-3xl text-blue-horizon mb-12 lg:mb-20 font-bold leading-relaxed">O Taxi Map contribui para uma Luanda mais conectada e eficiente.</p>

                                <div className="grid sm:grid-cols-2 gap-8 lg:gap-12">
                                    {[
                                        "Menos tempo perdido no trânsito",
                                        "Mais segurança para passageiros",
                                        "Melhor acesso à mobilidade urbana",
                                        "Informação clara para quem não conhece bem a cidade"
                                    ].map((text, idx) => (
                                        <div key={idx} className="flex gap-6 lg:gap-8 items-center bg-white/5 p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all shadow-inner">
                                            <CheckCircle2 className="w-8 h-8 lg:w-12 lg:h-12 text-amber-warm shrink-0" />
                                            <span className="text-lg lg:text-2xl font-bold leading-tight">{text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-16 lg:mt-24 pt-12 lg:pt-20 border-t border-white/10">
                                    <p className="font-display text-3xl sm:text-4xl lg:text-5xl text-amber-warm leading-none tracking-tight">É MAIS DO QUE UM MAPA.</p>
                                    <br />
                                    <p className="font-display text-3xl sm:text-4xl lg:text-5xl text-amber-warm leading-none tracking-tight">É UMA FERRAMENTA DE INCLUSÃO, EFICIÊNCIA E CIDADANIA.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </RevealSection>

            {/* Final CTA Section */}
            <RevealSection>
                <section className="py-20 lg:py-40 bg-white">
                    <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-10 lg:space-y-16">
                        <div className="space-y-4 lg:space-y-6">
                            <h2 className="font-display text-5xl lg:text-7xl text-blue-deep leading-none tracking-tight">JUNTA-TE AO TAXI MAP</h2>
                            <p className="text-xl lg:text-3xl text-slate-mid font-medium leading-relaxed">
                                Queres acompanhar o projeto, testar a plataforma ou contribuir com feedback?
                                <br className="hidden md:block" />
                                Inscreve-te para ter acesso antecipado.
                            </p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 lg:gap-8 items-center justify-center max-w-3xl mx-auto bg-sand p-4 rounded-[2.5rem] lg:rounded-[4rem]">
                            <input
                                type="email"
                                placeholder="Teu melhor e-mail"
                                className="w-full md:flex-1 px-6 py-5 lg:px-10 lg:py-7 rounded-[2rem] lg:rounded-[3rem] bg-white border-2 border-transparent focus:border-blue-sky outline-none transition-all text-lg lg:text-2xl font-medium placeholder:text-slate-light"
                            />
                            <button className="w-full md:w-auto bg-blue-atlantic text-white px-8 py-5 lg:px-14 lg:py-7 rounded-[2rem] lg:rounded-[3rem] font-bold text-lg lg:text-2xl hover:bg-blue-atlantic/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-atlantic/30">
                                Registar
                            </button>
                        </div>
                    </div>
                </section>
            </RevealSection>

            {/* Footer */}
            <footer className="py-16 lg:py-32 bg-blue-deep text-white">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-10 lg:space-y-16">
                    <div className="flex items-center justify-center gap-4 group">
                        <div className="bg-blue-atlantic p-3 lg:p-4 rounded-3xl shadow-2xl group-hover:rotate-12 transition-transform">
                            <img src="/icon/logo.png" alt="Taxi Map Logo" className="h-14 w-auto object-contain" />
                        </div>
                        <span className="font-display text-3xl lg:text-5xl tracking-tighter">TAXI MAP</span>
                    </div>
                    <p className="font-display text-3xl lg:text-7xl text-amber-warm italic tracking-tighter opacity-90">
                        "Saber para onde vais muda tudo."
                    </p>
                    <div className="pt-10 lg:pt-20 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <p className="text-slate-light font-bold text-sm lg:text-lg uppercase tracking-[0.3em]">
                            © {new Date().getFullYear()} TAXI MAP
                        </p>
                        <div className="flex gap-6 lg:gap-10">
                            <a href="https://www.linkedin.com/company/taxi-map?trk=public_post_follow-view-profile" target="_blank" rel="noopener noreferrer" className="text-slate-light hover:text-white transition-colors font-bold uppercase text-xs lg:text-sm tracking-widest">LinkedIn</a>
                            <a href="#" className="text-slate-light hover:text-white transition-colors font-bold uppercase text-xs lg:text-sm tracking-widest">Facebook</a>
                            <a href="#" className="text-slate-light hover:text-white transition-colors font-bold uppercase text-xs lg:text-sm tracking-widest">Instagram</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
