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
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
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
            <section className="relative w-full flex items-center min-h-[100dvh] pt-16 pb-8 lg:py-0 overflow-hidden">
                <div className="absolute inset-0 z-0 w-full h-full">
                    <MapComponent />
                    <div className="absolute inset-0 bg-blue-deep/30 z-[5]" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-deep via-blue-deep/30 to-transparent z-[6]" />
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-deep to-transparent z-[6]" />
                </div>

                <div className="hidden lg:block absolute top-0 right-0 z-10 animate-in fade-in slide-in-from-right-12 duration-700">
                    <img src="/img/taxi_azul.png" alt="Taxi Azul" className="w-48 xl:w-52 drop-shadow-2xl" />
                </div>

                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                        <div className="max-w-4xl space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 w-full">
                            <div className="space-y-3 lg:space-y-4">
                                <div className="space-y-2 lg:space-y-3">
                                    <div className="flex items-center gap-3">
                                        <img src="/icon/logo.png" alt="Taxi Map" className="h-10 sm:h-12 lg:h-14 w-auto" />
                                    </div>
                                    <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl text-blue-sky font-bold leading-tight">
                                        A forma mais simples, segura e inteligente de te moveres em Luanda
                                    </p>
                                </div>
                                <p className="text-slate-100 text-base sm:text-base md:text-lg font-medium max-w-3xl leading-relaxed">
                                    Mover-se em Luanda pode ser confuso e demorado. O Taxi Map ajuda-te a escolher o táxi certo e seguir a rota correta usando o mapa da cidade como guia.
                                </p>
                            </div>
                            <div className="mt-6 lg:mt-8 flex w-full">
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
                <section id="sobre" className="py-12 lg:py-20 bg-white relative z-20 border-t border-blue-horizon/10">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center mb-10 lg:mb-14">
                        <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-blue-horizon/20 rounded-2xl mb-6 lg:mb-8">
                            <img src="/img/taxi.png" alt="Taxi" className="w-10 h-10 lg:w-12 lg:h-12" />
                        </div>
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-blue-deep mb-4 lg:mb-6 leading-none tracking-tight">O QUE É O TAXI MAP?</h2>
                        <p className="text-base sm:text-lg lg:text-xl text-slate-mid max-w-4xl mx-auto leading-relaxed font-medium">
                            O Taxi Map é uma plataforma digital que ajuda cidadãos e visitantes a escolher o táxi certo, seguir a rota correta e chegar ao destino com mais eficiência e segurança, usando o mapa da cidade como guia.
                        </p>
                        <div className="mt-4 inline-block bg-blue-horizon/20 text-blue-atlantic px-5 py-2.5 rounded-lg font-bold text-sm lg:text-base">
                            Tudo pensado para a realidade dos candongueiros de Luanda.
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
                        {[
                            { icon: <MapPin className="w-5 h-5 lg:w-7 lg:h-7" />, color: 'text-blue-atlantic bg-blue-horizon/20', title: "Localização", desc: "Ver no mapa quais táxis passam perto de ti" },
                            { icon: <Navigation className="w-5 h-5 lg:w-7 lg:h-7" />, color: 'text-emerald-600 bg-emerald-100', title: "Confirmação", desc: "Confirmar se estás na rota correta em tempo real" },
                            { icon: <Wallet className="w-5 h-5 lg:w-7 lg:h-7" />, color: 'text-amber-dark bg-amber-light', title: "Economia", desc: "Comparar rotas mais rápidas e mais económicas" },
                            { icon: <ShieldCheck className="w-5 h-5 lg:w-7 lg:h-7" />, color: 'text-rose-600 bg-rose-100', title: "Segurança", desc: "Sentir-te seguro ao saber onde estás e para onde vais" },
                        ].map((item, idx) => (
                            <div key={idx} className="group p-5 lg:p-7 bg-sand rounded-2xl lg:rounded-3xl hover:bg-white hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 border border-blue-horizon/5 text-center flex flex-col items-center">
                                <div className={`mb-4 lg:mb-5 transform group-hover:scale-110 transition-transform duration-300 p-3 bg-white rounded-xl shadow-sm ${item.color.split(' ')[0]}`}>
                                    <div className={item.color.split(' ')[0]}>
                                        {item.icon}
                                    </div>
                                </div>
                                <h3 className="font-display text-xl lg:text-2xl text-blue-deep mb-2 lg:mb-3 tracking-wide">{item.title}</h3>
                                <p className="text-slate-mid text-sm lg:text-base font-medium leading-snug">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </RevealSection>

            {/* Pain Points Section */}
            <RevealSection>
                <section className="py-12 lg:py-20 bg-blue-deep text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[200px] lg:w-[400px] h-[200px] lg:h-[400px] bg-amber-warm/10 blur-[60px] lg:blur-[80px] rounded-full" />
                    <div className="absolute bottom-0 left-0 -translate-y-1/3 -translate-x-1/3 w-[140px] lg:w-[280px] h-[140px] lg:h-[280px] bg-blue-sky/10 blur-[60px] lg:blur-[80px] rounded-full" />
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
                            <div className="space-y-6 lg:space-y-10">
                                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight">TENS ALGUMA DESTAS DÚVIDAS?</h2>
                                <div className="space-y-3 lg:space-y-5">
                                    {[
                                        "Não sabes qual táxi pegar para chegar ao teu destino?",
                                        "Ficas inseguro se o táxi que apanhaste está mesmo a seguir a rota certa?",
                                        "Queres saber qual o caminho mais económico até onde precisas de ir?",
                                        "Gostarias de viajar com pessoas que vão para o mesmo destino que tu?"
                                    ].map((q, idx) => (
                                        <div key={idx} className="flex gap-3 lg:gap-5 items-start bg-white/5 p-5 lg:p-6 rounded-xl lg:rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                                            <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-blue-sky shrink-0 mt-0.5" />
                                            <p className="text-base lg:text-lg font-bold leading-tight">{q}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="inline-flex items-center gap-3 lg:gap-4 bg-amber-warm text-blue-deep px-6 py-3 lg:px-8 lg:py-4 rounded-full font-bold text-lg lg:text-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
                                    <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                                    O Taxi Map foi criado exatamente para ti.
                                </div>
                            </div>
                            <div className="relative group hidden lg:block">
                                <div className="absolute -inset-4 bg-amber-warm/10 rounded-[3rem] blur-2xl group-hover:bg-amber-warm/20 transition-all" />
                                <img src="img/unnamed.webp" alt="Luanda Traffic" className="relative rounded-[3rem] shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700 object-cover aspect-[4/5] w-full" />
                            </div>
                        </div>
                    </div>
                </section>
            </RevealSection>

            {/* Vantagens Section */}
            <RevealSection>
                <section id="vantagens" className="py-12 lg:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-10 lg:mb-16 space-y-3 lg:space-y-4">
                            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-blue-deep leading-none tracking-tight">PENSADO PARA A REALIDADE DE LUANDA</h2>
                            <p className="text-base lg:text-xl text-slate-mid font-medium max-w-3xl mx-auto">O Taxi Map não é um app genérico. Ele é construído com base em:</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
                            {[
                                { title: "ROTAS REAIS", desc: "Baseado nas rotas dos candongueiros" },
                                { title: "PARAGENS INFORMAIS", desc: "Conhecimento das paragens diárias" },
                                { title: "FLUXOS DA CIDADE", desc: "Entendimento do tráfego local" },
                                { title: "EXPERIÊNCIA REAL", desc: "Quem vive Luanda todos os dias" }
                            ].map((item, idx) => (
                                <div key={idx} className="group p-5 lg:p-7 bg-sand border border-blue-horizon/5 rounded-2xl lg:rounded-3xl hover:border-blue-sky/30 hover:bg-white hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 text-center">
                                    <div className="w-10 h-10 lg:w-14 lg:h-14 bg-blue-atlantic text-white rounded-2xl flex items-center justify-center font-display text-xl lg:text-2xl mb-4 lg:mb-6 shadow-lg mx-auto group-hover:scale-110 transition-transform duration-300">
                                        {idx + 1}
                                    </div>
                                    <h4 className="font-display text-lg lg:text-xl text-blue-deep mb-2 lg:mb-3 tracking-wide">{item.title}</h4>
                                    <p className="text-slate-mid text-sm lg:text-base font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 lg:mt-16 text-center">
                            <p className="text-lg lg:text-2xl font-bold italic text-white bg-blue-atlantic inline-block px-6 py-3 lg:px-10 lg:py-5 rounded-xl shadow-lg rotate-[-0.5deg]">
                                "Tecnologia ao serviço das pessoas, não o contrário."
                            </p>
                        </div>
                    </div>
                </section>
            </RevealSection>

            {/* Impact Section */}
            <RevealSection>
                <section id="impacto" className="py-12 lg:py-20 bg-sand">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="bg-blue-deep rounded-2xl lg:rounded-3xl p-6 sm:p-10 lg:p-16 text-white relative overflow-hidden shadow-xl">
                            <Globe2 className="absolute -bottom-8 -right-8 lg:-bottom-16 lg:-right-16 w-[120px] lg:w-[280px] h-[120px] lg:h-[280px] text-white/5 rotate-12" />
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-atlantic/10 to-transparent" />
                            <div className="relative z-10 max-w-5xl">
                                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-5 lg:mb-8 leading-none tracking-tight">IMPACTO SOCIAL</h2>
                                <p className="text-lg lg:text-2xl text-blue-horizon mb-8 lg:mb-12 font-bold leading-relaxed">O Taxi Map contribui para uma Luanda mais conectada e eficiente.</p>

                                <div className="grid sm:grid-cols-2 gap-5 lg:gap-8">
                                    {[
                                        "Menos tempo perdido no trânsito",
                                        "Mais segurança para passageiros",
                                        "Melhor acesso à mobilidade urbana",
                                        "Informação clara para quem não conhece bem a cidade"
                                    ].map((text, idx) => (
                                        <div key={idx} className="flex gap-4 lg:gap-5 items-center bg-white/5 p-5 lg:p-7 rounded-xl lg:rounded-2xl border border-white/10 hover:bg-white/10 transition-all shadow-inner">
                                            <CheckCircle2 className="w-5 h-5 lg:w-7 lg:h-7 text-amber-warm shrink-0" />
                                            <span className="text-base lg:text-lg font-bold leading-tight">{text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10 lg:mt-16 pt-8 lg:pt-12 border-t border-white/10">
                                    <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-amber-warm leading-none tracking-tight">É MAIS DO QUE UM MAPA.</p>
                                    <br />
                                    <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-amber-warm leading-none tracking-tight">É UMA FERRAMENTA DE INCLUSÃO, EFICIÊNCIA E CIDADANIA.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </RevealSection>

            {/* Final CTA Section */}
            <RevealSection>
                <section className="py-12 lg:py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-6 lg:space-y-10">
                        <div className="space-y-3 lg:space-y-4">
                            <h2 className="font-display text-3xl lg:text-5xl text-blue-deep leading-none tracking-tight">JUNTA-TE AO TAXI MAP</h2>
                            <p className="text-lg lg:text-2xl text-slate-mid font-medium leading-relaxed">
                                Queres acompanhar o projeto, testar a plataforma ou contribuir com feedback?
                                <br className="hidden md:block" />
                                Inscreve-te para ter acesso antecipado.
                            </p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 lg:gap-5 items-center justify-center max-w-2xl mx-auto bg-sand p-3 lg:p-4 rounded-2xl lg:rounded-3xl">
                            <input
                                type="email"
                                placeholder="Teu melhor e-mail"
                                className="w-full md:flex-1 px-5 py-3.5 lg:px-8 lg:py-5 rounded-xl lg:rounded-2xl bg-white border border-blue-horizon/10 focus:border-blue-sky outline-none transition-all text-base lg:text-lg font-medium placeholder:text-slate-light"
                            />
                            <button className="w-full md:w-auto bg-blue-atlantic text-white px-6 py-3.5 lg:px-10 lg:py-5 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg hover:bg-blue-atlantic/90 hover:scale-105 active:scale-95 transition-all shadow-md shadow-blue-atlantic/20">
                                Registar
                            </button>
                        </div>
                    </div>
                </section>
            </RevealSection>

            {/* Footer */}
            <footer className="py-10 lg:py-16 bg-blue-deep text-white">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-8 lg:space-y-10">
                    <div className="flex items-center justify-center">
                        <div className="bg-blue-atlantic p-2 lg:p-3 rounded-2xl shadow-lg hover:rotate-6 transition-transform">
                            <img src="/icon/logo.png" alt="Taxi Map Logo" className="h-10 w-auto object-contain" />
                        </div>
                    </div>
                    <p className="font-display text-2xl lg:text-5xl text-amber-warm italic tracking-tighter opacity-90">
                        "Saber para onde vais muda tudo."
                    </p>
                    <div className="pt-8 lg:pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-slate-light font-bold text-xs lg:text-sm uppercase tracking-[0.2em]">
                            © {new Date().getFullYear()} TAXI MAP
                        </p>
                        <div className="flex gap-5 lg:gap-8">
                            <a href="https://www.linkedin.com/company/taxi-map?trk=public_post_follow-view-profile" target="_blank" rel="noopener noreferrer" className="text-slate-light hover:text-white transition-colors font-bold uppercase text-[10px] lg:text-xs tracking-wider">LinkedIn</a>
                            <a href="#" className="text-slate-light hover:text-white transition-colors font-bold uppercase text-[10px] lg:text-xs tracking-wider">Facebook</a>
                            <a href="#" className="text-slate-light hover:text-white transition-colors font-bold uppercase text-[10px] lg:text-xs tracking-wider">Instagram</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
