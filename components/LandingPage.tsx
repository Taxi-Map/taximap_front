
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    ShieldCheck,
    ArrowRight,
    Navigation,
    Wallet,
    AlertCircle,
    CheckCircle2,
    Globe2,
} from 'lucide-react';
import { Header } from './Header';
import { MapComponent } from './MapComponent';
import Loader from './Loader';
import SearchInput from './SearchInput';

export default function LandingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/map?destination=${encodeURIComponent(searchQuery)}`);
    };

    if (isInitialLoading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden selection:bg-yellow-400 selection:text-slate-900">
            <Header />

            {/* Hero Section */}
            <section className="relative w-full flex items-center min-h-[100dvh] pt-20 pb-10 lg:py-0 overflow-hidden">

                {/* Map as Background */}
                <div className="absolute inset-0 z-0 w-full h-full">
                    <MapComponent />
                    {/* Layered overlays for maximum readability without white cards */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] z-[5]" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/30 to-transparent z-[6]" />
                </div>

                {/* Imagem do táxi no canto superior direito */}
                <div className="hidden lg:block absolute top-0 right-0 z-10 animate-in fade-in slide-in-from-right-12 duration-1000">
                    <img
                        src="/img/taxi_azul.png"
                        alt="Taxi Azul"
                        className="w-68 xl:w-74 drop-shadow-2xl"
                    />
                </div>


                {/* Content directly over the map - No white background card */}
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Conteúdo (textos e formulário) */}
                        <div className="max-w-4xl space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000 w-full">
                            <div className="space-y-4 lg:space-y-6">


                                <div className="space-y-2 lg:space-y-4">
                                    <div className="flex items-center gap-4">
                                        <img src="/icon/logo.png" alt="Logo" className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" />
                                        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                                            Taxi Map
                                        </h1>
                                    </div>
                                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#6db7e2] font-extrabold leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                        A forma mais simples, segura e inteligente de se locomover em Luanda
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
                                    onSubmit={() => handleSearch({ preventDefault: () => { } } as React.FormEvent)}
                                    loading={false}
                                    placeholder="Para onde vais?"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sections below - only visible after scroll */}
            {/* About Section */}
            <section id="sobre" className="py-16 lg:py-32 bg-white relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.2)] rounded-t-[3rem] lg:rounded-t-[4rem]">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center mb-12 lg:mb-20">
                    <div className="inline-block p-6 bg-blue-400/20 rounded-[2rem] mb-8 lg:mb-10">
                        <img src="/img/taxi.png" alt="Taxi" className="w-16 h-16 lg:w-24 lg:h-24" />
                    </div>
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 lg:mb-10 text-slate-900 tracking-tight">O que é o Taxi Map?</h2>
                    <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-semibold">
                        O Taxi Map é uma plataforma digital que ajuda cidadãos e visitantes a escolher o táxi certo, seguir a rota correta e chegar ao destino com mais eficiência e segurança, usando o mapa da cidade como guia.
                        <br /><br />
                        <span className="text-slate-900 bg-blue-400/30 px-4 py-1 rounded-xl">Tudo pensado para a realidade dos candongueiros de Luanda.</span>
                    </p>
                </div>

                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                    {[
                        { icon: <MapPin className="text-blue-600 w-8 h-8 lg:w-10 lg:h-10" />, title: "Localização", desc: "Ver no mapa quais táxis passam perto de ti" },
                        { icon: <Navigation className="text-emerald-600 w-8 h-8 lg:w-10 lg:h-10" />, title: "Confirmação", desc: "Confirmar se estás na rota correta em tempo real" },
                        { icon: <Wallet className="text-amber-600 w-8 h-8 lg:w-10 lg:h-10" />, title: "Economia", desc: "Comparar rotas mais rápidas e mais económicas" },
                        { icon: <ShieldCheck className="text-rose-600 w-8 h-8 lg:w-10 lg:h-10" />, title: "Segurança", desc: "Sentir-te seguro ao saber onde estás e para onde vais" }
                    ].map((item, idx) => (
                        <div key={idx} className="p-8 lg:p-12 bg-slate-50 rounded-[2.5rem] lg:rounded-[3rem] hover:bg-white hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-yellow-400/40 group text-center flex flex-col items-center">
                            <div className="mb-6 lg:mb-8 transform group-hover:scale-125 transition-transform duration-500 p-4 bg-white rounded-2xl shadow-sm">{item.icon}</div>
                            <h3 className="font-black text-xl lg:text-2xl mb-3 lg:mb-4 text-slate-900">{item.title}</h3>
                            <p className="text-slate-600 text-base lg:text-lg font-bold leading-snug">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pain Points Section */}
            <section className="py-16 lg:py-32 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-yellow-400/10 blur-[100px] lg:blur-[150px] rounded-full"></div>
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <div className="space-y-8 lg:space-y-14">
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight">Tens alguma destas dúvidas?</h2>
                            <div className="space-y-4 lg:space-y-8">
                                {[
                                    "Não sabes qual táxi pegar para chegar ao teu destino?",
                                    "Ficas inseguro se o táxi que apanhaste está mesmo a seguir a rota certa?",
                                    "Queres saber qual o caminho mais económico até onde precisas de ir?",
                                    "Gostarias de viajar com pessoas que vão para o mesmo destino que tu?"
                                ].map((q, idx) => (
                                    <div key={idx} className="flex gap-4 lg:gap-8 items-start bg-white/5 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all duration-300">
                                        <AlertCircle className="w-8 h-8 lg:w-10 lg:h-10 text-[#6db7e2] shrink-0" />
                                        <p className="text-lg lg:text-2xl font-black leading-tight">{q}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="inline-flex items-center gap-4 lg:gap-6 bg-[#6db7e2] text-white px-8 py-4 lg:px-10 lg:py-5 rounded-full font-black text-xl lg:text-2xl shadow-2xl hover:scale-105 transition-transform cursor-pointer">
                                <ArrowRight className="w-6 h-6 lg:w-8 lg:h-8" />
                                O Taxi Map foi criado exatamente para ti.
                            </div>
                        </div>
                        <div className="relative group hidden lg:block">
                            <div className="absolute -inset-6 bg-yellow-400/20 rounded-[4rem] blur-3xl group-hover:bg-yellow-400/30 transition-all"></div>
                            <img src="img/unnamed.webp" alt="Luanda Traffic" className="relative rounded-[4rem] shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-1000 object-cover aspect-[4/5] w-full" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Reality of Luanda Section */}
            <section id="vantagens" className="py-16 lg:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="text-center mb-12 lg:mb-24 space-y-4 lg:space-y-6">
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Pensado para a realidade de Luanda</h2>
                        <p className="text-lg lg:text-2xl text-slate-600 font-bold max-w-3xl mx-auto">O Taxi Map não é um app genérico. Ele é construído com base em:</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                        {[
                            { title: "Rotas Reais", desc: "Baseado nas rotas dos candongueiros" },
                            { title: "Paragens Informais", desc: "Conhecimento das paragens diárias" },
                            { title: "Fluxos da Cidade", desc: "Entendimento do tráfego local" },
                            { title: "Experiência Real", desc: "Quem vive Luanda todos os dias" }
                        ].map((item, idx) => (
                            <div key={idx} className="p-8 lg:p-12 bg-slate-50 border-2 border-transparent rounded-[2.5rem] lg:rounded-[3rem] hover:border-[#6db7e2] hover:bg-white hover:shadow-2xl transition-all duration-300 text-center">
                                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#6db7e2] text-white rounded-3xl flex items-center justify-center font-black text-3xl lg:text-4xl mb-6 lg:mb-10 shadow-xl mx-auto">
                                    {idx + 1}
                                </div>
                                <h4 className="font-black text-xl lg:text-2xl mb-3 lg:mb-4 text-slate-900">{item.title}</h4>
                                <p className="text-slate-500 text-base lg:text-lg font-bold leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 lg:mt-24 text-center">
                        <p className="text-xl lg:text-3xl font-black italic text-white bg-[#6db7e2] inline-block px-8 py-4 lg:px-12 lg:py-6 rounded-[2rem] shadow-xl rotate-[-1deg]">
                            "Tecnologia ao serviço das pessoas, não o contrário."
                        </p>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section id="impacto" className="py-16 lg:py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="bg-slate-900 rounded-[3rem] lg:rounded-[5rem] p-8 sm:p-16 lg:p-28 text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                        <Globe2 className="absolute -bottom-12 -right-12 lg:-bottom-24 lg:-right-24 w-[250px] lg:w-[500px] h-[250px] lg:h-[500px] text-white/5 rotate-12" />
                        <div className="relative z-10 max-w-5xl">
                            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black mb-8 lg:mb-12 leading-tight tracking-tight">Impacto Social</h2>
                            <p className="text-xl lg:text-3xl text-slate-400 mb-12 lg:mb-20 font-bold leading-relaxed">O Taxi Map contribui para uma Luanda mais conectada e eficiente.</p>

                            <div className="grid sm:grid-cols-2 gap-8 lg:gap-12">
                                {[
                                    "Menos tempo perdido no trânsito",
                                    "Mais segurança para passageiros",
                                    "Melhor acesso à mobilidade urbana",
                                    "Informação clara para quem não conhece bem a cidade"
                                ].map((text, idx) => (
                                    <div key={idx} className="flex gap-6 lg:gap-8 items-center bg-white/5 p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all shadow-inner">
                                        <CheckCircle2 className="w-8 h-8 lg:w-12 lg:h-12 text-emerald-400 shrink-0" />
                                        <span className="text-lg lg:text-2xl font-black leading-tight">{text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-16 lg:mt-24 pt-12 lg:pt-20 border-t border-white/10">
                                <p className="text-2xl sm:text-4xl lg:text-5xl font-black text-yellow-400 leading-tight tracking-tight">É mais do que um mapa.</p>
                                <br></br>
                                <p className="text-2xl sm:text-4xl lg:text-5xl font-black text-yellow-400 leading-tight tracking-tight">É uma ferramenta de inclusão, eficiência e cidadania.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 lg:py-40 bg-white">
                <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-10 lg:space-y-16">
                    <div className="space-y-4 lg:space-y-6">
                        <h2 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter">Junta-te ao Taxi Map</h2>
                        <p className="text-xl lg:text-3xl text-slate-600 font-bold leading-relaxed">
                            Queres acompanhar o projeto, testar a plataforma ou contribuir com feedback?
                            <br className="hidden md:block" />
                            Inscreve-te para ter acesso antecipado.
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 lg:gap-8 items-center justify-center max-w-3xl mx-auto bg-slate-100 p-4 rounded-[2.5rem] lg:rounded-[4rem]">
                        <input
                            type="email"
                            placeholder="Teu melhor e-mail"
                            className="w-full md:flex-1 px-6 py-5 lg:px-10 lg:py-7 rounded-[2rem] lg:rounded-[3rem] bg-white border-2 border-transparent focus:border-yellow-400 outline-none transition-all text-lg lg:text-2xl font-black"
                        />
                        <button className="w-full md:w-auto bg-slate-900 text-white px-8 py-5 lg:px-14 lg:py-7 rounded-[2rem] lg:rounded-[3rem] font-black text-lg lg:text-2xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-2xl">
                            Registar
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 lg:py-32 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-10 lg:space-y-16">
                    <div className="flex items-center justify-center gap-4 group">
                        <div className="bg-[#6db7e2] p-3 lg:p-4 rounded-3xl shadow-2xl group-hover:rotate-12 transition-transform">
                            {/* Add a logo here */}
                            <img src="/icon/logo.png" alt="Taxi Map Logo" className="h-14 w-auto object-contain" />
                        </div>
                        <span className="font-black text-3xl lg:text-5xl tracking-tighter">Taxi Map</span>
                    </div>
                    <p className="text-3xl lg:text-7xl font-black text-yellow-400 italic tracking-tighter opacity-90">
                        "Saber para onde vais muda tudo."
                    </p>
                    <div className="pt-10 lg:pt-20 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <p className="text-slate-500 font-black text-sm lg:text-lg uppercase tracking-[0.3em]">
                            © {new Date().getFullYear()} TAXI MAP
                        </p>
                        <div className="flex gap-6 lg:gap-10">
                            <a href="https://www.linkedin.com/company/taxi-map?trk=public_post_follow-view-profile" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors font-black uppercase text-xs lg:text-sm tracking-widest">LinkedIn</a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors font-black uppercase text-xs lg:text-sm tracking-widest">Facebook</a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors font-black uppercase text-xs lg:text-sm tracking-widest">Instagram</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
