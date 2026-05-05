import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ShieldIcon,
  BrainIcon,
  DocumentIcon,
  EyeIcon,
  ChartIcon,
  LockIcon,
  FingerprintIcon,
  ClockIcon,
  CheckIcon,
  ArrowRightIcon,
  CubeIcon,
  LightbulbIcon,
  BuildingIcon,
  UserIcon,
  GlobeIcon,
  CodeIcon,
  BoltIcon,
  LinkIcon,
  BanknoteIcon,
  TargetIcon,
  ChipIcon,
  ServerIcon,
  ScaleIcon,
  SparklesIcon,
  RocketIcon,
  PlayIcon,
  LogoMark,
  ExclamationIcon,
} from '../components/Icons';

gsap.registerPlugin(ScrollTrigger);

const SectionHeader = ({ title, subtitle, align = 'center', dark = false }) => {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  const titleColor = dark ? 'text-white' : 'text-slate-900';
  const subtitleColor = dark ? 'text-slate-300' : 'text-slate-600';
  return (
    <div className={`mb-16 ${alignClass}`}>
      <h2 className={`text-4xl md:text-5xl font-bold mb-4 tracking-tight ${titleColor}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-xl max-w-2xl mx-auto ${subtitleColor}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current, 
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
        }
      }
    );
  }, [delay]);

  return (
    <div ref={cardRef} className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-6 group-hover:from-emerald-100 group-hover:to-teal-100 transition-colors">
        <Icon className="w-6 h-6 text-emerald-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
};

const ProblemCard = ({ number, title, description, delay = 0 }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
        }
      }
    );
  }, [delay]);

  return (
    <div ref={cardRef} className="relative p-8 bg-slate-900 rounded-2xl text-white overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/50 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <span className="text-6xl font-bold text-emerald-500/60 mb-4 block">{number}</span>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const TimelineItem = ({ phase, status, items, isLast, delay = 0 }) => {
  const itemRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(itemRef.current,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        delay,
        scrollTrigger: {
          trigger: itemRef.current,
          start: 'top 90%',
        }
      }
    );
  }, [delay]);

  return (
    <div ref={itemRef} className="flex gap-6">
      <div className="flex flex-col items-center">
        <div className={`w-4 h-4 rounded-full ring-4 ${
          status === 'Completado' ? 'bg-emerald-500 ring-emerald-100' :
          status === 'En desarrollo' ? 'bg-amber-400 ring-amber-100 animate-pulse' :
          status === 'Planificación' ? 'bg-blue-400 ring-blue-100' :
          'bg-emerald-500 ring-emerald-100'
        }`} />
        {!isLast && <div className="w-0.5 h-32 bg-slate-200" />}
      </div>
      <div className="pb-12">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-lg font-bold text-slate-900">{phase}</h3>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            status === 'Completado' ? 'bg-emerald-100 text-emerald-700' :
            status === 'En desarrollo' ? 'bg-amber-100 text-amber-700' :
            status === 'Planificación' ? 'bg-blue-100 text-blue-700' :
            status === 'Actual' ? 'bg-emerald-100 text-emerald-700' :
            'bg-slate-100 text-slate-600'
          }`}>
            {status}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span key={idx} className="text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

import logoLight from '../assets/logos/logo-light.png';
import logoDark from '../assets/logos/logo-dark.png';

export function Home() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(titleRef.current, 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, overwrite: 'auto' })
        .fromTo(subtitleRef.current, 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6, overwrite: 'auto' }, '-=0.4')
        .fromTo(ctaRef.current.children, 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, overwrite: 'auto' }, '-=0.2');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('.animate-on-scroll');
    sections.forEach((section) => {
      gsap.fromTo(section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
          }
        }
      );
    });
  }, []);

  const problems = [
    {
      number: '01',
      title: 'Asimetría de información',
      description: 'El 78% de los usuarios firma contratos sin comprender las cláusulas clave. El lenguaje jurídico complejo genera riesgo involuntario y decisiones poco informadas.',
    },
    {
      number: '02',
      title: 'Brechas de seguridad',
      description: 'Las soluciones de firma digital actuales no garantizan identidad real. La suplantación sigue siendo posible sin verificación biométrica robusta.',
    },
    {
      number: '03',
      title: 'Fragmentación del mercado',
      description: 'Herramientas separadas para firma, verificación de identidad y análisis legal. Experiencia incompleta que genera desconfianza y fricción.',
    },
  ];

  const solutions = [
    {
      icon: BrainIcon,
      title: 'Resumen Inteligente',
      description: 'IA que traduce lenguaje jurídico a términos comprensibles. Identificamos cláusulas clave, obligaciones y fechas importantes.',
    },
    {
      icon: EyeIcon,
      title: 'Semáforo de Riesgo',
      description: 'Análisis ML que clasifica términos en rojo, amarillo y verde. Visualización inmediata del nivel de riesgo contractual.',
    },
    {
      icon: FingerprintIcon,
      title: 'Biometría Avanzada',
      description: 'Verificación facial con prueba de vida (liveness detection). Garantizamos que eres tú quien firma, no una fotografía.',
    },
    {
      icon: LockIcon,
      title: 'Trazabilidad Críptica',
      description: 'Hash + timestamp + registro audiovisual. Evidencia legal sólida e inmutable de todo el proceso de firma.',
    },
  ];

  const differentiators = [
    {
      icon: CubeIcon,
      title: 'Plataforma Integrada',
      description: 'Unificamos análisis, verificación y firma en una sola experiencia. Sin herramientas separadas, sin fricción.',
    },
    {
      icon: UserIcon,
      title: 'Enfoque B2C',
      description: 'Nos enfocamos en el usuario final, no solo en empresas. Democratizamos la comprensión contractual.',
    },
    {
      icon: SparklesIcon,
      title: 'IA Explicable',
      description: 'Asistente conversacional que explica con transparencia total cada cláusula analizada.',
    },
    {
      icon: LinkIcon,
      title: 'Escalabilidad Modular',
      description: 'Arquitectura que permite crecer sin reescribir. Fase por fase, validando con el mercado real.',
    },
  ];

  const technologies = [
    { icon: CodeIcon, name: 'NLP & LLMs', desc: 'Procesamiento de lenguaje natural' },
    { icon: ChipIcon, name: 'Computer Vision', desc: 'Reconocimiento facial y liveness' },
    { icon: LockIcon, name: 'Criptografía', desc: 'Hashing y timestamps' },
    { icon: ServerIcon, name: 'Cloud Infra', desc: 'AWS / GCP escalable' },
  ];

  const roadmap = [
    {
      phase: 'Análisis con IA',
      status: 'Completado',
      items: ['Resumen automático', 'Detección de riesgos', 'Identificación de obligaciones'],
    },
    {
      phase: 'Firma Digital',
      status: 'Completado',
      items: ['Firma electrónica', 'Verificación biométrica', 'Evidencia legal'],
    },
    {
      phase: 'Biometría Avanzada',
      status: 'En desarrollo',
      items: ['Reconocimiento facial', 'Prueba de vida', 'Comparación de rostros'],
    },
    {
      phase: 'Integraciones',
      status: 'Planificación',
      items: ['API REST', 'Webhook de eventos', 'Dashboard empresarial'],
    },
  ];

  const metrics = [
    { value: '78%', label: 'Usuarios que firman sin entender' },
    { value: '<2min', label: 'Tiempo promedio de análisis' },
    { value: '99.9%', label: 'Precisión en verificación' },
    { value: '0', label: 'Incidentes de seguridad' },
  ];

  return (
    <div ref={heroRef} className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoDark} alt="SafeSign Logo" className="h-16 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Iniciar sesión
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25"
            >
              Comenzar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-slate-50" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)', backgroundSize: '60px 60px' }} 
        />
        
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-80 h-80 border border-emerald-200/30 rounded-full" />
        <div className="absolute top-20 right-10 w-96 h-96 border border-emerald-200/20 rounded-full" />
        <div className="absolute bottom-20 left-10 w-64 h-64 border border-teal-200/30 rounded-full" />
        
        {/* Gradient orbs */}
        <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-teal-100/40 to-transparent rounded-full blur-3xl" />
        
        {/* Floating geometric elements */}
        <div className="absolute top-40 left-[10%] w-3 h-3 bg-emerald-400/40 rounded-full" />
        <div className="absolute top-60 left-[15%] w-2 h-2 bg-emerald-400/30 rounded-full" />
        <div className="absolute top-32 right-[15%] w-2 h-2 bg-teal-400/40 rounded-full" />
        <div className="absolute bottom-40 right-[20%] w-3 h-3 bg-teal-400/30 rounded-full" />
        
        {/* Dotted pattern */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent" />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-transparent to-slate-50/80" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div ref={titleRef}>
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                No solo firmas.
                <br />
                <span className="text-emerald-600">Entiendes.</span>
              </h1>
            </div>
            
            <p ref={subtitleRef} className="text-xl md:text-2xl text-slate-600 max-w-xl mx-auto leading-relaxed mb-10">
              La plataforma de firma digital que analiza, verifica y firma con seguridad legal.
            </p>

            <div ref={ctaRef} className="flex justify-center">
              <button
                onClick={() => navigate('/register')}
                className="group px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all hover:shadow-xl hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                Crear cuenta gratuita
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 bg-slate-900 animate-on-scroll">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            title="El problema que enfrentamos" 
            subtitle="Millones de personas firman contratos cada día sin entender realmente qué están aceptando"
            dark
          />
          
          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((problem, idx) => (
              <ProblemCard key={idx} {...problem} delay={idx * 0.15} />
            ))}
          </div>

          {/* Metrics banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">{metric.value}</div>
                <div className="text-slate-400 text-sm">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-white animate-on-scroll">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            title="Nuestra solución integral" 
            subtitle="Una plataforma que unifica seguridad, comprensión y respaldo legal en una experiencia fluida"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((sol, idx) => (
              <FeatureCard key={idx} {...sol} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className="py-24 bg-slate-50 animate-on-scroll">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            title="Por qué somos diferentes" 
            subtitle="Integración de tecnologías que el mercado actual trata de forma fragmentada"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((item, idx) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <item.icon className="w-6 h-6 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 bg-white animate-on-scroll">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader 
                title="Stack tecnológico" 
                subtitle="Arquitectura moderna diseñada para escalar"
              />
              
              <div className="grid grid-cols-2 gap-4">
                {technologies.map((tech, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <tech.icon className="w-6 h-6 text-emerald-600 mb-2" />
                    <p className="font-semibold text-slate-900">{tech.name}</p>
                    <p className="text-xs text-slate-500">{tech.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl" />
              <div className="relative p-8 bg-slate-900 rounded-3xl text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
                
                <h3 className="text-2xl font-bold mb-6">Fase de desarrollo</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-emerald-400 font-medium">Análisis con IA</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-emerald-400 font-medium">Firma Digital</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                    <span>Verificación Biométrica</span>
                  </div>
                  <div className="flex items-center gap-4 opacity-50">
                    <div className="w-3 h-3 rounded-full bg-slate-500" />
                    <span>API y Dashboard</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progreso total</span>
                    <span className="text-emerald-400 font-semibold">60%</span>
                  </div>
                  <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="py-24 bg-slate-900 text-white animate-on-scroll">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            title="Modelo de negocio" 
            subtitle="Freemium con acceso democrático"
            dark
          />

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <BanknoteIcon className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Análisis Gratuito</h3>
              <p className="text-slate-400 text-sm mb-4">
                Cualquier usuario puede cargar y analizar documentos sin costo. 
                democratizamos la comprensión contractual.
              </p>
              <div className="text-3xl font-bold text-emerald-400">$0</div>
            </div>

            <div className="p-8 bg-emerald-600/20 rounded-2xl border-2 border-emerald-500/50">
              <RocketIcon className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Firma Certificada</h3>
              <p className="text-slate-300 text-sm mb-4">
                Pago por documento con verificación biométrica completa y evidencia criptográfica.
              </p>
              <div className="text-3xl font-bold text-white">$3.000<span className="text-lg text-slate-400 font-normal">/doc</span></div>
            </div>

            <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <TargetIcon className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Paquetes Empresariales</h3>
              <p className="text-slate-400 text-sm mb-4">
                Planes para empresas con API, dashboard analytics y soporte dedicado.
              </p>
              <div className="text-3xl font-bold text-emerald-400">Custom</div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <GlobeIcon className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Mercado objetivo: Colombia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-24 bg-white animate-on-scroll">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            title="Hoja de ruta" 
            subtitle="Desarrollo progresivo con validación de mercado"
          />

          <div className="max-w-2xl">
            {roadmap.map((item, idx) => (
              <TimelineItem 
                key={idx} 
                {...item} 
                isLast={idx === roadmap.length - 1}
                delay={idx * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 animate-on-scroll">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Revolucionemos la firma digital juntos
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Únete a la plataforma que está transformando cómo las personas 
            entienden y firman contratos. Sin suscripciones, sin complejidad.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-emerald-500/25"
            >
              Crear cuenta gratis
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-white/20 text-white hover:border-white/40 font-semibold rounded-xl transition-all"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logoLight} alt="SafeSign Logo" className="h-12 w-auto object-contain" />
              </div>
              <p className="text-sm">
                La plataforma de firma digital inteligente que transforma cada contrato en una decisión informada.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguridad</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">&copy; 2026 SafeSign. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <GlobeIcon className="w-4 h-4" />
                <span>Español</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}