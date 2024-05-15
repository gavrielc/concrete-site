import {useState, useCallback} from 'preact/hooks';

import qm from '../assets/client-logos/QM.png';
import buildots from '../assets/client-logos/Buildots.webp';
import ox from '../assets/client-logos/Ox.png';
import pinecone from '../assets/client-logos/Pinecone.svg';
import runai from '../assets/client-logos/Runai.svg';
import wilco from '../assets/client-logos/Wilco.png';
import aporia from '../assets/client-logos/Aporia.svg';
import cipia from '../assets/client-logos/Cipia.png';
import spectral from '../assets/client-logos/Spectral.svg';
import anyword from '../assets/client-logos/Anyword.svg';
import armo from '../assets/client-logos/Armo.png';
import port from '../assets/client-logos/Port.svg';
import aidoc from '../assets/client-logos/Aidoc.png';
import scopio from '../assets/client-logos/Scopio.png';
import lumigo from '../assets/client-logos/Lumigo.svg';
import privya from '../assets/client-logos/Privya.svg';
import arnica from '../assets/client-logos/Arnica.webp';
import rookout from '../assets/client-logos/Rookout.png';
import sayata from '../assets/client-logos/Sayata.png';
import imperva from '../assets/client-logos/Imperva.png';
import swimm from '../assets/client-logos/Swimm.svg';
import explorium from '../assets/client-logos/Explorium.svg';
import jit from '../assets/client-logos/Jit.svg';
import tatio from '../assets/client-logos/Tatio.png';
import safeguard from '../assets/client-logos/Safeguard.png';
import masterschool from '../assets/client-logos/Masterschool.webp';
import frontegg from '../assets/client-logos/Frontegg.svg';
import nexar from '../assets/client-logos/Nexar.png';
import storai from '../assets/client-logos/Storai.png';
import datree from '../assets/client-logos/Datree.png';
import anima from '../assets/client-logos/Anima.png';
import bright from '../assets/client-logos/Bright.png';
import cybermdx from '../assets/client-logos/Cybermdx.png';
import dia from '../assets/client-logos/DIA.webp';
import dig from '../assets/client-logos/Dig.svg';
import lightrun from '../assets/client-logos/Lightrun.png';
import stoke from '../assets/client-logos/Stoke.svg';
import ubeya from '../assets/client-logos/Ubeya.svg';
import voom from '../assets/client-logos/Voom.png';
import gable from '../assets/client-logos/Gable.svg';
import qwak from '../assets/client-logos/Qwak.svg';
import gem from '../assets/client-logos/Gem.png';
import axiom from '../assets/client-logos/Axiom.svg';
import akeyless from '../assets/client-logos/Akeyless.svg';
import deepdub from '../assets/client-logos/Deepdub.svg';
import uveye from '../assets/client-logos/UVeye.svg';
import noogata from '../assets/client-logos/Noogata.svg';
import tlv from '../assets/client-logos/TLV.svg';
import deepchecks from '../assets/client-logos/deepchecks.svg';
import codium from '../assets/client-logos/codium.svg';
import leapxpert from '../assets/client-logos/LeapXpert.png';
import wiremock from '../assets/client-logos/wiremock.png';
import aiola from '../assets/client-logos/aiOla.png';
import team8 from '../assets/client-logos/team8.png';
import vectary from '../assets/client-logos/Vectary.svg';
import invgate from '../assets/client-logos/invgate.svg';
import scaleops from '../assets/client-logos/scaleops.svg';
import prompt from '../assets/client-logos/promptsecurity.svg';
import infield from '../assets/client-logos/infield.svg';
import lunar from '../assets/client-logos/lunar.svg';
import askai from '../assets/client-logos/askai.svg';
import statement from '../assets/client-logos/statement.svg';
import scala from '../assets/client-logos/scala.webp';
import ioriver from '../assets/client-logos/ioriver.png';
import coralogix from '../assets/client-logos/Coralogix.svg';
import fairgen from '../assets/client-logos/fairgen.svg';
import pvml from '../assets/client-logos/pvml.svg';
import aisap from '../assets/client-logos/aisap.svg';

const clients = [
    {logo: qm, name: "qm", site: 'https://www.quantum-machines.co/', tags: ['deep tech', '2024']},
    {logo: buildots, name: "buildots", site: 'https://buildots.com/', tags: ['AI & ML', '2024']},
    {logo: runai, name: "runai", site: 'https://www.run.ai/', tags: ['AI & ML', 'saas', '2024']},
    {logo: pinecone, name: "pinecone", site: 'https://www.pinecone.io/', tags: ['AI & ML', 'saas', '2024']},
    {logo: codium, name: "Codium", site: 'https://www.codium.ai/', tags: ['AI & ML', 'saas', 'dev', '2024']},
    {logo: team8, name: "Team8", site: 'https://team8.vc/', tags: ['AI & ML', 'security', 'fintech', 'medtech', '2024']},
    {logo: coralogix, name: "Coralogix", site: 'https://coralogix.com/', tags: ['saas', 'dev', 'security', '2024']},
    {logo: cipia, name: "cipia", site: 'https://cipia.com/', tags: ['AI & ML', '2024']},
    {logo: akeyless, name: "akeyless", site: 'https://www.akeyless.io/', tags: ['security', 'saas', 'dev', '2024']},
    {logo: aiola, name: "aiOla", site: 'https://aiola.com/', tags: ['AI & ML', '2024']},
    {logo: tlv, name: "TLV Partners", site: 'https://www.tlv.partners/', tags: ['AI & ML', 'deep tech', 'security', 'saas', 'dev']},
    {logo: vectary, name: "Vectary", site: 'https://www.vectary.com/', tags: ['saas', 'dev', '2024']},
    {logo: invgate, name: "InvGate", site: 'https://invgate.com/', tags: ['saas', '2024']},
    {logo: lunar, name: "Lunar.dev", site: 'https://www.lunar.dev/', tags: ['saas', 'dev', '2024']},
    {logo: deepdub, name: "deepdub", site: 'https://deepdub.ai/', tags: ['AI & ML', 'saas', '2024']},
    {logo: scaleops, name: "ScaleOps", site: 'https://scaleops.com/', tags: ['saas', 'dev', '2024']},
    {logo: prompt, name: "Prompt Security", site: 'https://www.prompt.security/', tags: ['saas', 'dev', 'security', 'AI & ML', '2024']},
    {logo: pvml, name: "PVML", site: 'https://pvml.com/', tags: ['saas', 'AI & ML', 'dev', '2024']},
    {logo: fairgen, name: "Fairgen", site: 'https://www.fairgen.ai/', tags: ['saas', 'AI & ML', '2024']},
    {logo: ioriver, name: "IO River", site: 'https://www.ioriver.io/', tags: ['saas', 'dev', '2024']},
    {logo: aisap, name: "aisap.ai", site: 'https://www.aisap.ai/', tags: ['saas', 'medtech', 'AI & ML', '2024']},
    {logo: statement, name: 'Statement', site: 'https://www.statement.io/', tags: ['fintech', 'AI & ML', 'saas']},
    {logo: dig, name: 'dig', site: 'https://www.dig.security/', tags: ['security', 'saas']},
    {logo: wilco, name: "wilco", site: 'https://www.trywilco.com/', tags: ['dev']},
    {logo: swimm, name: "swimm", site: 'https://swimm.io/', tags: ['dev', 'saas']},
    {logo: spectral, name: "spectral", site: 'https://spectralops.io/', tags: ['dev', 'security', 'saas']},
    {logo: aidoc, name: "aidoc", site: 'https://www.aidoc.com/', tags: ['medtech', 'AI & ML']},
    {logo: ox, name: "ox", site: 'https://www.ox.security/', tags: ['security', 'saas']},
    {logo: uveye, name: "UVEYE", site: 'https://www.uveye.com/', tags: ['AI & ML']},
    {logo: anyword, name: "anyword", site: 'https://anyword.com/', tags: ['AI & ML']},
    {logo: arnica, name: "arnica", site: 'https://www.arnica.io/', tags: ['security', 'dev', 'saas']},
    {logo: gem, name: "gem", site: 'https://www.gem.security/', tags: ['dev', 'security', 'saas']},
    {logo: aporia, name: "aporia", site: 'https://www.aporia.com/', tags: ['AI & ML', 'saas']},
    {logo: nexar, name: "nexar", site: 'https://www.getnexar.com/', tags: ['AI & ML']},
    {logo: noogata, name: "noogata", site: 'https://noogata.com/', tags: ['AI & ML', 'saas']},
    {logo: privya, name: "privya", site: 'https://privya.ai/', tags: ['security']},
    {logo: askai, name: "Ask-AI", site: 'https://www.ask-ai.com/', tags: ['saas', 'AI & ML']},
    {logo: scala, name: "Scala", site: 'https://www.scala-bio.com/', tags: ['AI & ML']},
    {logo: gable, name: "gable", site: 'https://www.gable.to/', tags: ['saas', 'hr']},
    {logo: leapxpert, name: "LeapXpert", site: 'https://www.leapxpert.com//', tags: ['dev', 'security', 'saas']},
    {logo: qwak, name: "qwak", site: 'https://www.qwak.com/', tags: ['AI & ML', 'saas']},
    {logo: port, name: "port", site: 'https://www.getport.io/', tags: ['dev', 'saas']},
    {logo: deepchecks, name: "Deepchecks", site: 'https://deepchecks.com/', tags: ['saas', 'AI & ML', 'dev']},
    {logo: axiom, name: "axiom", site: 'https://axiom.security/', tags: ['security', 'saas']},
    {logo: infield, name: "Infield", site: 'https://www.infield.ai/', tags: ['saas', 'dev', 'AI & ML', '2024']},
    {logo: wiremock, name: "wiremock", site: 'https://wiremock.org/', tags: ['dev', 'saas']},
    {logo: sayata, name: "sayata", site: 'https://www.sayatalabs.com/', tags: ['insurtech']},
    {logo: armo, name: "armo", site: 'https://www.armosec.io/', tags: ['dev', 'security']},
    {logo: scopio, name: "scopio", site: 'https://scopiolabs.com/', tags: ['medtech']},
    {logo: lumigo, name: "lumigo", site: 'https://www.lumigo.io/', tags: ['dev', 'saas']},
    {logo: rookout, name: "rookout", site: 'https://www.rookout.com/', tags: ['dev', 'saas']},
    {logo: imperva, name: "imperva", site: 'https://www.imperva.com/', tags: ['security', 'saas']},
    {logo: explorium, name: "explorium", site: 'https://www.explorium.ai/', tags: ['AI & ML', 'saas']},
    {logo: tatio, name: "tatio", site: 'https://www.tatio.io/', tags: ['saas', 'hr']},
    {logo: masterschool, name: "masterschool", site: 'https://www.masterschool.com/', tags: ['dev']},
    {logo: frontegg, name: "frontegg", site: 'https://frontegg.com/', tags: ['dev', 'saas']},
    {logo: jit, name: "jit", site: 'https://www.jit.io/', tags: ['security', 'dev', 'saas']},
    {logo: storai, name: "storai", site: 'https://stor.ai/', tags: []},
    {logo: datree, name: "datree", site: 'https://www.datree.io/', tags: ['security', 'dev', 'saas']},
    {logo: voom, name: 'voom', site: 'https://www.voominsurance.com/', tags: ['insurtech']},
    {logo: dia, name: 'dia', site: 'https://www.dia-analysis.com/', tags: ['medtech']},
    {logo: cybermdx, name: 'cybermdx', site: 'https://www.cybermdx.com/', tags: ['security', 'medtech']},
    {logo: safeguard, name: "safeguard", site: 'https://en.safeguard.co.il/', tags: ['AI & ML']},
    {logo: anima, name: 'anima', site: 'https://www.animaapp.com/', tags: ['dev', 'saas']},
    {logo: ubeya, name: 'ubeya', site: 'https://www.ubeya.com/', tags: ['saas', 'hr']},
    {logo: stoke, name: 'stoke', site: 'https://www.stoke.world/', tags: ['saas', 'hr']},
    {logo: lightrun, name: 'lightrun', site: 'https://lightrun.com/', tags: ['dev', 'saas']},
    {logo: bright, name: 'bright', site: 'https://brightsec.com/', tags: ['dev', 'security', 'saas']},
];

const tags = [
    {name: '2024', value: '2024'},
    {name: 'AI & ML', value: 'AI & ML'},
    {name: 'B2B SaaS', value: 'saas'},
    {name: 'CyberSecurity', value: 'security'},
    {name: 'Developer Tools', value: 'dev'},
    {name: 'Medtech', value: 'medtech'},
    {name: 'HR Tech', value: 'hr'}
];

export default function Clients() {
    const [value, setValue] = useState('2024');
    const filter = useCallback((tag) => {
        const newValue = value == tag ? null : tag;
        setValue(newValue);
    }, [value]);

    return (
        <>
            <div className='tags'>
                {tags.map(({name, value: val}) => <button className={'tag'.concat(value == val ? ' active' : '')} onClick={() => filter(val)}>{name}</button>)}
            </div>
            <div className='logos-wrapper'>
                {clients.filter(({tags}) => !value || tags.includes(value)).map(({logo, site, name}) => <a href={site} target="_blank" key={name}><img class="logo" src={logo.src} alt={`${name} logo`}/></a>)}
            </div>
        </>
    );
}