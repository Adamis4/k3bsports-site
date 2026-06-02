/* ─────────────────────────────────────────────
   K3B Sports — Shared Utilities
   ───────────────────────────────────────────── */

const K3B = (() => {

  /* ── LocalStorage helpers ── */
  const store = {
    get: (key) => { try { return JSON.parse(localStorage.getItem('k3b_' + key)); } catch { return null; } },
    set: (key, val) => localStorage.setItem('k3b_' + key, JSON.stringify(val)),
    remove: (key) => localStorage.removeItem('k3b_' + key),
    clear: () => Object.keys(localStorage).filter(k => k.startsWith('k3b_')).forEach(k => localStorage.removeItem(k))
  };

  /* ── Auth ── */
  const auth = {
    getUser: () => store.get('user'),
    getAdmin: () => store.get('admin'),
    isAthleteLoggedIn: () => !!store.get('user'),
    isAdminLoggedIn: () => !!store.get('admin'),

    loginAthlete: (userData) => {
      store.set('user', { ...userData, loginTime: Date.now() });
    },
    loginAdmin: (adminData) => {
      store.set('admin', { ...adminData, loginTime: Date.now() });
    },
    logoutAthlete: () => {
      store.remove('user');
      window.location.href = '/index.html';
    },
    logoutAdmin: () => {
      store.remove('admin');
      window.location.href = '/admin/login.html';
    },
    requireAthlete: () => {
      if (!auth.isAthleteLoggedIn()) window.location.href = '/athlete/login.html';
    },
    requireAdmin: () => {
      if (!auth.isAdminLoggedIn()) window.location.href = '/admin/login.html';
    }
  };

  /* ── Athletes DB (localStorage) ── */
  const athletes = {
    getAll: () => store.get('athletes') || [],
    getById: (id) => athletes.getAll().find(a => a.id === id),
    getByEmail: (email) => athletes.getAll().find(a => a.email.toLowerCase() === email.toLowerCase()),

    save: (athlete) => {
      const all = athletes.getAll();
      const idx = all.findIndex(a => a.id === athlete.id);
      if (idx >= 0) all[idx] = athlete;
      else all.unshift(athlete);
      store.set('athletes', all);
      return athlete;
    },

    create: (data) => {
      const athlete = {
        id: 'ath_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: [],
        consultationDate: null
      };
      athletes.save(athlete);
      return athlete;
    },

    update: (id, updates) => {
      const athlete = athletes.getById(id);
      if (!athlete) return null;
      const updated = { ...athlete, ...updates, updatedAt: new Date().toISOString() };
      athletes.save(updated);
      return updated;
    },

    addNote: (id, note, adminName) => {
      const athlete = athletes.getById(id);
      if (!athlete) return null;
      const notes = athlete.notes || [];
      notes.unshift({ text: note, author: adminName, createdAt: new Date().toISOString(), id: Date.now() });
      return athletes.update(id, { notes });
    },

    getStats: () => {
      const all = athletes.getAll();
      return {
        total: all.length,
        pending: all.filter(a => a.status === 'pending').length,
        review: all.filter(a => a.status === 'review').length,
        accepted: all.filter(a => a.status === 'accepted').length,
        rejected: all.filter(a => a.status === 'rejected').length,
        monitoring: all.filter(a => a.status === 'monitoring').length,
      };
    }
  };

  /* ── Notifications (in-app) ── */
  const notify = {
    show: (msg, type = 'success', duration = 3500) => {
      const existing = document.getElementById('k3b-toast');
      if (existing) existing.remove();

      const colors = {
        success: { bg: 'rgba(76,175,80,0.12)', border: 'rgba(76,175,80,0.3)', text: '#4CAF50' },
        error: { bg: 'rgba(244,67,54,0.12)', border: 'rgba(244,67,54,0.3)', text: '#F44336' },
        warning: { bg: 'rgba(255,152,0,0.12)', border: 'rgba(255,152,0,0.3)', text: '#FF9800' },
        info: { bg: 'rgba(184,151,58,0.12)', border: 'rgba(184,151,58,0.3)', text: '#B8973A' },
      };
      const c = colors[type] || colors.info;
      const toast = document.createElement('div');
      toast.id = 'k3b-toast';
      toast.style.cssText = `
        position:fixed; bottom:32px; right:32px; z-index:9999;
        background:${c.bg}; border:1px solid ${c.border}; color:${c.text};
        padding:14px 24px; font-family:'Inter',sans-serif;
        font-size:12px; font-weight:500; letter-spacing:1px;
        text-transform:uppercase; backdrop-filter:blur(8px);
        animation: slideIn 0.3s ease; max-width:320px;
      `;
      toast.textContent = msg;

      const style = document.createElement('style');
      style.textContent = '@keyframes slideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(style);
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), duration);
    }
  };

  /* ── Format helpers ── */
  const fmt = {
    date: (iso) => {
      if (!iso) return '—';
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    dateShort: (iso) => {
      if (!iso) return '—';
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },
    time: (iso) => {
      if (!iso) return '—';
      return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    },
    scoreColor: (score) => {
      if (score >= 70) return '#4CAF50';
      if (score >= 45) return '#FF9800';
      return '#F44336';
    },
    statusLabel: (status) => {
      const map = { pending:'Pending Review', review:'Under Review', accepted:'Accepted', rejected:'Not a Fit', monitoring:'Monitoring' };
      return map[status] || status;
    },
    statusClass: (status) => {
      const map = { pending:'badge-warning', review:'badge-gold', accepted:'badge-success', rejected:'badge-danger', monitoring:'badge-neutral' };
      return map[status] || 'badge-neutral';
    },
    initials: (name) => {
      if (!name) return '??';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    }
  };

  /* ── Claude API call ── */
  const ai = {
    evaluate: async (athleteData) => {
      const { firstName, lastName, sport, level, answers, scores } = athleteData;
      const overall = Math.round((scores.physical + scores.psychological + scores.social + scores.environment) / 4);

      const DOMAINS_DATA = [
        { tag:"Physical", questions:[
          {id:"q3",text:"To what extent does physical pain prevent you from doing what you need to do?",labels:["Not at all","A little","Moderate","Very much","Extreme"],reverse:true},
          {id:"q4",text:"How much do you need medical treatment to function in your daily life?",labels:["Not at all","A little","Moderate","Very much","Extreme"],reverse:true},
          {id:"q10",text:"Do you have enough energy for everyday training and life?",labels:["Not at all","A little","Moderately","Mostly","Completely"]},
          {id:"q15",text:"How well are you able to get around and move your body?",labels:["Very poor","Poor","Neutral","Good","Very good"]},
          {id:"q16",text:"How satisfied are you with your sleep?",labels:["Very dissatisfied","Dissatisfied","Neutral","Satisfied","Very satisfied"]},
          {id:"q17",text:"How satisfied are you with your ability to perform your daily living activities?",labels:["Very dissatisfied","Dissatisfied","Neutral","Satisfied","Very satisfied"]},
          {id:"q18",text:"How satisfied are you with your capacity for work and performance?",labels:["Very dissatisfied","Dissatisfied","Neutral","Satisfied","Very satisfied"]}
        ]},
        { tag:"Psychological", questions:[
          {id:"q5",text:"How much do you enjoy life?",labels:["Not at all","A little","Moderate","Very much","Extremely"]},
          {id:"q6",text:"To what extent do you feel your life to be meaningful?",labels:["Not at all","A little","Moderate","Very much","Extremely"]},
          {id:"q7",text:"How well are you able to concentrate?",labels:["Not at all","A little","Moderately","Very well","Extremely well"]},
          {id:"q11",text:"Are you able to accept your bodily appearance?",labels:["Not at all","A little","Moderately","Mostly","Completely"]},
          {id:"q19",text:"How satisfied are you with yourself?",labels:["Very dissatisfied","Dissatisfied","Neutral","Satisfied","Very satisfied"]},
          {id:"q26",text:"How often do you have negative feelings such as blue mood, despair, anxiety, or depression?",labels:["Never","Seldom","Quite often","Very often","Always"],reverse:true}
        ]},
        { tag:"Social", questions:[
          {id:"q20",text:"How satisfied are you with your personal relationships?",labels:["Very dissatisfied","Dissatisfied","Neutral","Satisfied","Very satisfied"]},
          {id:"q21",text:"How satisfied are you with your sex life?",labels:["Very dissatisfied","Dissatisfied","Neutral","Satisfied","Very satisfied"]},
          {id:"q22",text:"How satisfied are you with the support you get from your friends?",labels:["Very dissatisfied","Dissatisfied","Neutral","Satisfied","Very satisfied"]}
        ]},
        { tag:"Environment", questions:[
          {id:"q8",text:"How safe do you feel in your daily life?",labels:["Not at all","A little","Moderately","Very","Extremely"]},
          {id:"q9",text:"How healthy is your physical environment (home, training space)?",labels:["Very poor","Poor","Neutral","Good","Very good"]},
          {id:"q12",text:"Have you enough money to meet your needs?",labels:["Not at all","A little","Moderately","Mostly","Completely"]},
          {id:"q13",text:"How available to you is the information you need in your day-to-day life?",labels:["Not at all","A little","Moderately","Mostly","Completely"]},
          {id:"q14",text:"To what extent do you have the opportunity for leisure and recovery activities?",labels:["Not at all","A little","Moderately","Mostly","Completely"]},
          {id:"q23",text:"How satisfied are you with the conditions of your living place?",labels:["Very dissatisfied","Dissatisfied","Neutral","Satisfied","Very satisfied"]},
          {id:"q24",text:"How satisfied are you with your access to health services?",labels:["Very dissatisfied","Dissatisfied","Neutral","Satisfied","Very satisfied"]},
          {id:"q25",text:"How satisfied are you with your transport?",labels:["Very dissatisfied","Dissatisfied","Neutral","Satisfied","Very satisfied"]}
        ]}
      ];

      const surveyText = DOMAINS_DATA.map(d =>
        d.tag + ':\n' + d.questions.map(q => {
          const val = answers[q.id] || 3;
          return `  - ${q.text} → ${val}/5 (${q.labels[val-1]})`;
        }).join('\n')
      ).join('\n\n');

      const prompt = `You are the AI evaluation engine for K3B Sports Management — an elite, selective athlete management company. Review this athlete's WHO-validated quality of life assessment and provide a detailed evaluation for the K3B team.

ATHLETE PROFILE:
Name: ${firstName} ${lastName}
Sport: ${sport || 'Not specified'}
Level: ${level || 'Not specified'}

DOMAIN SCORES (0-100):
- Physical Health: ${scores.physical}/100
- Psychological Wellbeing: ${scores.psychological}/100
- Social Relations: ${scores.social}/100
- Environment & Resources: ${scores.environment}/100
- Overall: ${overall}/100

FULL ASSESSMENT RESPONSES:
${surveyText}

Respond ONLY with valid JSON (no markdown, no backticks, no preamble):
{
  "recommendation": "REVIEW" or "MONITOR" or "PASS",
  "headline": "4-6 word punchy athlete summary",
  "overallVerdict": "2 sentences. Direct, professional assessment of this athlete's overall profile for K3B.",
  "physicalSummary": "1-2 sentences on physical health findings.",
  "psychSummary": "1-2 sentences on psychological wellbeing findings.",
  "socialSummary": "1 sentence on social/support network findings.",
  "envSummary": "1 sentence on environment and resources findings.",
  "topStrength": "One specific strength identified from the data.",
  "keyOpportunity": "The single most important area where K3B can provide value.",
  "redFlags": ["array", "of", "specific", "concerns", "if any — empty array if none"],
  "athleteMessage": "2-3 sentences written directly to the athlete. Professional, encouraging, honest. Tell them what their results show about them as a person and athlete without over-promising about K3B services."
}

RECOMMENDATION GUIDE:
- REVIEW: Strong overall profile (overall 60+), coachable signals, K3B can clearly add value. Priority for consultation.
- MONITOR: Mixed signals, some areas of concern, or insufficient data. K3B should watch this athlete.
- PASS: Significant concerns across multiple domains, not a good fit at this time.`;

      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) throw new Error('API call failed');
      const data = await res.json();
      return data.result;
    }
  };

  /* ── Score calculator ── */
  const scoring = {
    compute: (answers) => {
      const domainScore = (qids, reverseIds = []) => {
        const vals = qids.map(id => {
          let v = answers[id] || 3;
          if (reverseIds.includes(id)) v = 6 - v;
          return v;
        });
        const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
        return Math.round((mean * 4 - 4) * (100 / 16));
      };
      return {
        physical: domainScore(['q3','q4','q10','q15','q16','q17','q18'], ['q3','q4']),
        psychological: domainScore(['q5','q6','q7','q11','q19','q26'], ['q26']),
        social: domainScore(['q20','q21','q22']),
        environment: domainScore(['q8','q9','q12','q13','q14','q23','q24','q25'])
      };
    },
    overall: (scores) => Math.round((scores.physical + scores.psychological + scores.social + scores.environment) / 4)
  };

  /* ── Seed demo data ── */
  const seed = {
    demoAthletes: () => {
      if (athletes.getAll().length > 0) return;
      const demos = [
        {
          firstName:'Marcus',lastName:'Thompson',email:'marcus.t@email.com',
          sport:'Basketball',level:'Professional',password:'demo123',
          scores:{physical:72,psychological:68,social:81,environment:59},
          aiEvaluation:{
            recommendation:'REVIEW',
            headline:'High-ceiling pro with support gaps',
            overallVerdict:'Marcus presents a strong physical profile with genuine psychological resilience. His environment scores warrant attention — resource access and living conditions may be limiting his ceiling.',
            physicalSummary:'Physical health scores indicate good baseline fitness with minor pain management considerations. Energy and sleep are solid.',
            psychSummary:'Strong sense of purpose and enjoyment. Concentration scores are elite-tier. Minimal negative mood indicators.',
            socialSummary:'Robust personal relationships and peer support — an asset for longevity.',
            envSummary:'Financial and environmental factors are a concern and may benefit from K3B structural support.',
            topStrength:'Psychological focus and purpose-driven mindset — rare at this level.',
            keyOpportunity:'Environmental stabilization and resource planning could unlock 15-20% performance ceiling.',
            redFlags:['Below-average financial stability score','Limited access to health services noted'],
            athleteMessage:'Marcus, your assessment reveals a mentally strong athlete who knows why he plays. Your focus scores are in the top tier of athletes we see. The areas to address are structural, not personal — and those are exactly what K3B is built to help with.'
          },
          status:'review',
          createdAt: new Date(Date.now() - 2 * 24*60*60*1000).toISOString()
        },
        {
          firstName:'Jasmine',lastName:'Rivera',email:'jasmine.r@email.com',
          sport:'Track & Field',level:'College / NCAA',password:'demo123',
          scores:{physical:55,psychological:49,social:63,environment:71},
          aiEvaluation:{
            recommendation:'MONITOR',
            headline:'Talented but mentally stretched',
            overallVerdict:'Jasmine shows promise in environmental stability and social support, but psychological indicators suggest she is operating under significant stress. Physical scores are moderate for a track athlete at this level.',
            physicalSummary:'Physical profile is below expected range for NCAA track. Sleep satisfaction is particularly low — a key recovery concern.',
            psychSummary:'Negative mood frequency is elevated. Enjoyment of sport and sense of meaning have declined — common signs of early burnout.',
            socialSummary:'Friend support network is solid, which is a protective factor worth leveraging.',
            envSummary:'Strong environmental scores suggest stable home base and adequate resources.',
            topStrength:'Stable external environment provides a strong foundation to rebuild from.',
            keyOpportunity:'Psychological wellbeing and burnout prevention is the primary intervention point.',
            redFlags:['Elevated negative mood score','Low sleep satisfaction','Reduced enjoyment of sport — burnout indicator'],
            athleteMessage:'Jasmine, your results show someone with a strong support system around her who may be carrying more internal weight than others see. Your physical environment is solid — the next step is building the mental infrastructure to match. That is coachable.'
          },
          status:'monitoring',
          createdAt: new Date(Date.now() - 5 * 24*60*60*1000).toISOString()
        },
        {
          firstName:'Devon',lastName:'Williams',email:'devon.w@email.com',
          sport:'NFL',level:'Professional',password:'demo123',
          scores:{physical:88,psychological:79,social:74,environment:83},
          aiEvaluation:{
            recommendation:'REVIEW',
            headline:'Elite profile across all four domains',
            overallVerdict:'Devon presents one of the most complete profiles we have seen. High scores across all four domains with no significant red flags. This is an athlete operating near their ceiling who would benefit from maintenance and optimization work.',
            physicalSummary:'Elite physical health indicators. Pain is minimal, energy is excellent, and work capacity satisfaction is high.',
            psychSummary:'Strong psychological profile. High enjoyment, purpose, and focus scores. Very low negative mood frequency.',
            socialSummary:'Healthy relationships and strong support network in place.',
            envSummary:'Well-resourced environment. Financial stability and health access are both strong.',
            topStrength:'Complete, balanced profile — no single domain is a liability.',
            keyOpportunity:'Optimization and career longevity planning — maximizing the peak, not recovering from a deficit.',
            redFlags:[],
            athleteMessage:'Devon, your results speak for themselves — this is a balanced, grounded athlete. Your scores suggest someone who has done the personal work alongside the physical. K3B\'s role with you would be about protecting and extending what you have already built.'
          },
          status:'accepted',
          createdAt: new Date(Date.now() - 8 * 24*60*60*1000).toISOString(),
          consultationDate: new Date(Date.now() + 3 * 24*60*60*1000).toISOString()
        },
        {
          firstName:'Tyler',lastName:'Okafor',email:'tyler.o@email.com',
          sport:'Soccer',level:'Semi-Professional',password:'demo123',
          scores:{physical:41,psychological:38,social:44,environment:35},
          aiEvaluation:{
            recommendation:'PASS',
            headline:'Significant challenges across all domains',
            overallVerdict:'Tyler\'s assessment reveals multiple areas of concern across all four domains. While K3B wishes him the best, the current profile suggests he would benefit more from foundational support services before engaging premium management.',
            physicalSummary:'Physical health scores are well below range. Pain impact and medical dependency are elevated concerns.',
            psychSummary:'Psychological indicators are low. Enjoyment, concentration, and self-satisfaction all score in the lower quartile.',
            socialSummary:'Limited social support and relationship satisfaction may be compounding other challenges.',
            envSummary:'Environmental and resource instability is the most pressing concern — foundational needs are not fully met.',
            topStrength:'Willingness to complete the assessment and engage with the process.',
            keyOpportunity:'Foundational stability and mental health support needed before performance management.',
            redFlags:['Low scores across all four domains','Environmental instability','Low psychological wellbeing','Physical pain significantly impacting daily function'],
            athleteMessage:'Tyler, completing this assessment shows self-awareness, and that matters. Your results suggest some areas that would benefit from direct support before focusing on performance management. We encourage you to speak with a healthcare or counseling professional as a first step.'
          },
          status:'rejected',
          createdAt: new Date(Date.now() - 12 * 24*60*60*1000).toISOString()
        }
      ];
      demos.forEach(d => {
        athletes.create({ ...d, answers: {} });
      });
    }
  };

  return { store, auth, athletes, notify, fmt, ai, scoring, seed };
})();

window.K3B = K3B;
