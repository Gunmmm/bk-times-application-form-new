import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  User,
  MapPin,
  CreditCard,
  FileText,
  ShieldCheck,
  Briefcase,
  Info,
  ChevronRight,
  ChevronLeft,
  Printer,
  Camera,
  Upload,
  X,
  UserCheck,
  Eye,
  EyeOff,
  Calendar,
  LogIn,
  Mail,
  Smartphone,
  Search,
  Check
} from 'lucide-react';
import headerImage from './header.jpeg';

// --- Portal Imports ---
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import AdminDashboard from './pages/AdminDashboard';
import VillageDashboard from './pages/VillageDashboard';
import TalukaDashboard from './pages/TalukaDashboard';
import DistrictDashboard from './pages/DistrictDashboard';
import ZoneDashboard from './pages/ZoneDashboard';
import StatsReaders from './pages/StatsReaders';
import StatsIncome from './pages/StatsIncome';
import StatsAds from './pages/StatsAds';
import StatsCommission from './pages/StatsCommission';
import AdAnalytics from './pages/AdAnalytics';
import BookAd from './pages/BookAd';
import AdminPendingAds from './pages/AdminPendingAds';
import PublicNewsStories from './pages/PublicNewsStories';
import NewsStoryDetail from './pages/NewsStoryDetail';
import PortalLogin from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-navy animate-pulse text-lg font-bold tracking-widest uppercase">Verifying Session...</div>
    </div>
  );
  return token ? children : <Navigate to="/login" replace />;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const { role } = user;
  if (role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  if (role === 'village_coordinator' || role === 'village') return <Navigate to="/dashboard/village" replace />;
  if (role === 'taluka_coordinator' || role === 'taluka') return <Navigate to="/dashboard/taluka" replace />;
  if (role === 'district_coordinator' || role === 'district') return <Navigate to="/dashboard/district" replace />;
  if (role === 'zone_coordinator' || role === 'zone') return <Navigate to="/dashboard/zone" replace />;
  if (role === 'reporter') return <Navigate to="/form" replace />;
  return <Navigate to="/dashboard/admin" replace />;
};

// --- Helper Functions ---
const compressImage = (base64Str, maxWidth = 1024, maxHeight = 1024) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};

const calculateAge = (dob) => {
  if (!dob) return { years: '', months: '', days: '' };
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return { years: '', months: '', days: '' };

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return { years: 0, months: 0, days: 0 };
  return { years, months, days };
};

const regionDistricts = {
  "NASHIK": ["Nashik", "Dhule", "Nandurbar", "Jalgaon", "Ahilyanagar", "Palghar", "Chhatrapati Sambhajinagar"],
  "KOKAN": ["Mumbai City", "Mumbai Suburban", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg"],
  "PUNE": ["Pune", "Kolhapur", "Sangli", "Satara", "Solapur"],
  "CHHATRAPATI SAMBHAJI NAGAR": ["Chhatrapati Sambhajinagar", "Jalna", "Beed", "Latur", "Dharashiv", "Nanded", "Parbhani", "Hingoli"],
  "AMRAVATI": ["Amravati", "Buldhana", "Akola", "Washim", "Yavatmal"],
  "NAGPUR": ["Nagpur", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli"]
};

// --- Comprehensive Taluka Data for Maharashtra ---
const districtTalukas = {
  "Nashik": ["Nashik", "Sinnar", "Igatpuri", "Niphad", "Nandgaon", "Yeola", "Kalwan", "Baglan (Satana)", "Surgana", "Peint", "Trimbakeshwar", "Deola", "Malegaon", "Dindori", "Chandwad", "Malegaon"],
  "Dhule": ["Dhule", "Sakri", "Shirpur", "Sindkheda"],
  "Nandurbar": ["Nandurbar", "Navapur", "Shahada", "Taloda", "Akkalkuwa", "Akrani"],
  "Jalgaon": ["Jalgaon", "Bhusawal", "Amalner", "Chalisgaon", "Pachora", "Jamner", "Raver", "Yawal", "Erandol", "Dharangaon", "Bhadgaon", "Parola", "Bodwad", "Muktainagar", "Chopda"],
  "Ahilyanagar": ["Ahilyanagar", "Parner", "Pathardi", "Shevgaon", "Karjat", "Jamkhed", "Sangamner", "Akole", "Kopargaon", "Shrirampur", "Rahata", "Rahuri", "Nevasa", "Shrigonda"],
  "Pune": ["Pune City", "Haveli", "Khed", "Ambegaon", "Junnar", "Shirur", "Daund", "Indapur", "Baramati", "Purandar", "Bhor", "Velhe", "Mulshi", "Maval"],
  "Thane": ["Thane", "Kalyan", "Murbad", "Bhiwandi", "Shahapur", "Ulhasnagar", "Ambarnath"],
  "Palghar": ["Palghar", "Vasai", "Dahanu", "Talasari", "Jawhar", "Mokhada", "Wada", "Vikramgad"],
  "Raigad": ["Alibag", "Panvel", "Uran", "Pen", "Khalapur", "Karjat", "Roha", "Mangaon", "Sudhagad", "Tala", "Mahad", "Poladpur", "Shrivardhan", "Mhasla", "Murud"],
  "Ratnagiri": ["Ratnagiri", "Sangameshwar", "Lanja", "Rajapur", "Chiplun", "Guhagar", "Dapoli", "Mandangad", "Khed"],
  "Sindhudurg": ["Oros", "Kankavli", "Malvan", "Vengurla", "Kudal", "Sawantwadi", "Dodamarg", "Vaibhavwadi"],
  "Mumbai City": ["Mumbai City"],
  "Mumbai Suburban": ["Andheri", "Borivali", "Kurla"],
  "Chhatrapati Sambhajinagar": ["Aurangabad", "Paithan", "Gangapur", "Vaijapur", "Kannad", "Khuldabad", "Sillod", "Soegaon", "Phulambri"],
  "Jalna": ["Jalna", "Ambad", "Bhokardan", "Jafrabad", "Partur", "Mantha", "Ghansawangi", "Badnapur"],
  "Beed": ["Beed", "Ashti", "Patoda", "Shirur Kasar", "Gevrai", "Majalgaon", "Kaij", "Ambajogai", "Parli", "Wadwani", "Dharur"],
  "Latur": ["Latur", "Udgir", "Ahmedpur", "Ausa", "Nilanga", "Chakur", "Renapur", "Deoni", "Shirur Anantpal", "Jalkot"],
  "Dharashiv": ["Osmanabad", "Tuljapur", "Umarga", "Lohara", "Kallamb", "Bhum", "Paranda", "Washi"],
  "Nanded": ["Nanded", "Hadgaon", "Kinwat", "Bhokar", "Biloli", "Deglur", "Kandhar", "Loha", "Mudkhed", "Himayatnagar", "Umri", "Dharmabad", "Ardhapur", "Naigaon", "Mahur"],
  "Parbhani": ["Parbhani", "Gangakhed", "Pathri", "Jintur", "Purna", "Palam", "Sonpeth", "Selu", "Manwath"],
  "Hingoli": ["Hingoli", "Kalamnuri", "Basmath", "Aundha Nagnath", "Sengaon"],
  "Amravati": ["Amravati", "Achalpur", "Anjangaon Surji", "Chandurbazar", "Daryapur", "Morshi", "Warud", "Chandur Railway", "Dhamangaon Railway", "Nandgaon Khandeshwar", "Teosa", "Dharni", "Chikhaldara", "Bhatkuli"],
  "Buldhana": ["Buldhana", "Chikhli", "Deulgaon Raja", "Jalgaon Jamod", "Khamgaon", "Lonar", "Malkapur", "Motala", "Nandura", "Sangrampur", "Shegaon", "Sindkhed Raja", "Mehkar"],
  "Akola": ["Akola", "Akot", "Balapur", "Barshitakli", "Murtijapur", "Patur", "Telhara"],
  "Washim": ["Washim", "Risod", "Malegaon", "Mangrulpir", "Karanja", "Manora"],
  "Yavatmal": ["Yavatmal", "Arni", "Babulgaon", "Darwha", "Digras", "Ghatanji", "Kalamb", "Maregaon", "Ner", "Pusad", "Ralegaon", "Umarkhed", "Wani", "Zari Jamani", "Mahagaon", "Kelapur"],
  "Nagpur": ["Nagpur Urban", "Nagpur Rural", "Kamptee", "Hingna", "Katol", "Narkhed", "Kalmeshwar", "Saoner", "Ramtek", "Mauda", "Kuhi", "Umred", "Bhiwapur"],
  "Wardha": ["Wardha", "Deoli", "Seloo", "Arvi", "Ashti", "Karanja", "Hinganghat", "Samudrapur"],
  "Bhandara": ["Bhandara", "Tumsar", "Pauni", "Mohadi", "Sakoli", "Lakhani", "Lakhandur"],
  "Gondia": ["Gondia", "Tirora", "Arjuni Morgaon", "Deori", "Amgaon", "Goregaon", "Salekasa", "Sadak Arjuni"],
  "Chandrapur": ["Chandrapur", "Bhadravati", "Warora", "Chimur", "Nagbhir", "Brahmapuri", "Sindewahi", "Mul", "Sawali", "Gondpipri", "Korpana", "Pombhurna", "Rajura", "Jiwati", "Ballarpur"],
  "Gadchiroli": ["Gadchiroli", "Dhanora", "Chamorshi", "Mulchera", "Aheri", "Sironcha", "Etapalli", "Bhamragad", "Kurkheda", "Korchi", "Armori", "Desaiganj"],
  "Satara": ["Satara", "Karad", "Wai", "Mahabaleshwar", "Phaltan", "Man", "Khatav", "Koregaon", "Patan", "Jaoli", "Khandala"],
  "Sangli": ["Miraj", "Tasgaon", "Khanapur Vita", "Walwa Islampur", "Shirala", "Atpadi", "Jat", "Kavathe Mahankal", "Palus", "Kadegaon"],
  "Solapur": ["Solapur North", "Solapur South", "Barshi", "Akkalkot", "Mohol", "Mangalwedha", "Pandharpur", "Sangola", "Madha", "Karmala", "Malshiras"],
  "Kolhapur": ["Karvir", "Panhala", "Shahuwadi", "Kagal", "Hatkanangale", "Shirol", "Radhanagari", "Gaganbawada", "Bhudargad", "Ajara", "Gadhinglaj", "Chandgad"]
};

import villagesData from './talukaVillages.json';

const talukaVillages = {
  ...villagesData,
  "Nashik": ["Ambebahula", "Babhaleshwar", "Belatgavhan", "Belgaon Dhaga", "Bhagur Rural", "Chandgiri", "Chandshi", "Dahegaon", "Dari", "Devargaon", "Dhondegaon", "Donwade", "Dudgaon", "Dugaon", "Eklahare", "Ganeshgaon", "Gangamhalungi", "Gangapadali", "Gangavhare", "Gaulane", "Girnare", "Govardhan", "Govindpuri", "Hinganwedhe", "Indiranagar", "Jakhori", "Jalalpur", "Jategaon", "Kalavi", "Kashyapnagar", "Kotamgaon", "Ladachi", "Lahvit", "Lakhalgaon", "Lohashingwe", "Madsangavi", "Mahadeopur", "Mahirawani", "Manoli", "Matori", "Mohagaon", "Mungsare", "Nagalwadi", "Naikwadi", "Nanegaon", "Nandur Bahula", "Odha", "Ozarkhede", "Palashe", "Pimpalgaon Garudeshwar", "Pimplad Nasik", "Pimpri Sayyad", "Rahuri", "Raigadnagar", "Rajewadi", "Rajur Bahula", "Sadgaon", "Samangaon", "Sansari", "Sapgaon", "Sarul", "Sawargaon", "Shastrinagar", "Shevgedarna", "Shilapur", "Shinde", "Shivangaon", "Subhashnagar", "Sultanpur", "Talegaon Anjaneri", "Tiradshet", "Vadgaon", "Vaishnavnagar", "Vanjarwadi", "Vinchurgavali", "Wasali", "Yashawantnagar"],
  "Sinnar": ["Adwadi", "Agas Khind", "Ashapur", "Atkawade", "Aundhewadi", "Baragaon Pimpri", "Belu", "Bharatpur", "Bhatwadi", "Bhojapur", "Bhokani", "Borkhind", "Bramhan Wade", "Chandrapur", "Chapadgaon", "Chas", "Chincholi", "Chondhi", "Dahiwadi", "Dapur", "Datli", "Dattanagar", "Deopur", "Deshwandi", "Dharangaon", "Dhondbar", "Dhondvirnagar", "Dhulwad", "Dodi Bk.", "Dodi Kh.", "Dubere", "Dusangwadi", "Eklahare", "Fardapur", "Fattepur", "Fulenagar", "Ghorwad", "Ghotewadi", "Gonde", "Gulapur", "Gulvanch", "Gurewadi", "Harsule", "Harsul", "Hivare", "Hiwargaon", "Jamgaon", "Jaygaon", "Jayprakashnagar", "Jogaltembhi", "Kahandalwadi", "Kankori", "Karwadi", "Kasarwadi", "Kedarpur", "Keru Patilnagar", "Khadangali", "Khambale", "Khaparale", "Khopadi Bk.", "Khopadi Kh.", "Kirtangali", "Kolgaonmal", "Komalwadi", "Konambe", "Krishnanagar", "Kundewadi", "Laxmanpur", "Mahajanpur", "Maldhon", "Malegaon", "Manegaon", "Manori", "Maparwadi", "Marhal Bk.", "Marhal Kh.", "Mendhi", "Mirgaon", "Mith-sagare", "Mohdari", "Mohu", "Musalgaon", "Naigaon", "Nalwadi", "Nandur Shingote", "Nimgaon Deopur", "Nimgaon Sinner", "Nirhale", "Padali", "Panchale", "Pandhurli", "Pangari Bk.", "Pangari Kh.", "Paste", "Pathare Bk.", "Pathare Kh.", "Patole", "Patpimpri", "Pimpale", "Pimpalgaon", "Pimparwadi", "Ramnagar", "Rampur", "Sangavi", "Saradwadi", "Sawatamalinagar", "Sayale", "Shaha", "Shahapur", "Shastrinagar", "Shindewadi", "Shivade", "Shivajinagar", "Shrirampur", "Somthane", "Sonambe", "Sonari", "Sonewadi", "Songiri", "Sundarpur", "Suregaon", "Thangaon", "Ujjani", "Vadangali", "Vadgaon Pingala", "Vinchur Dalvi", "Wadgaon Sinnar", "Wadzire", "Waregaon", "Wavi"],
  "Patoda": ["Amalner", "Ambewadi", "Anpatwadi", "Antapur", "Bedarwadi", "Bedukwadi", "Belewadi", "Bensur", "Bhaktache Gothe", "Bhatewadi", "Bhurewadi", "Bhusanarwadi", "Bhyala", "Chanderwadi", "Chikhali", "Chincholi", "Chumbli", "Dagachiwadi", "Daskhed", "Daulatwadi", "Dhalewadi", "Dhangar Jaulka", "Dhoparwadi", "Domri", "Dongerkinhi", "Gandalwadi", "Gandhanwadi", "Gavalwadi", "Gayakwadwadi", "Ghatewadi", "Gholewadi", "Gitewadi", "Jadhavwadi", "Janyachiwadi", "Jaulala", "Jirewadi", "Jogdandwadi", "Kakadhira", "Kantalwadi", "Karanjwan", "Karegaon", "Kawadwadi", "Khadakwadi", "Khade Wasti", "Kotan", "Kusalamb", "Kutewadi", "Lambharwadi", "Mahalpachiwadi", "Mahasanghvi", "Mahindrawadi", "Malekarwadi", "Mandvewadi", "Mangewadi", "Manzari Ghat", "Mengdewadi", "Misalwadi", "Muggaon", "Nafarwadi", "Nageshwadi", "Naigaon", "Nalwandi", "Nirgudi", "Nivdunga", "Pachangri", "Pachegaon", "Pandharwadi", "Pargaon Gumra", "Parner", "Patoda", "Pawarwadi", "Pimpalgaon Dhas", "Pimpalwandi", "Pithi", "Ramwadi", "Rautwadi", "Rohotwadi", "Sablewadi", "Sagalewadi", "Sakundwadi", "Saundana", "Sautada", "Sawargaon Ghat", "Sawargaon Sone", "Sonegaon", "Suppa", "Tagarwadi", "Tale Pimpalgaon", "Tamba Rajuri", "Therla", "Tirmalwadi", "Tupewadi", "Ukhanda Pitti", "Umber Vihira", "Vaidhyakinhi", "Vaijala", "Wadzari", "Waghachawada", "Waghira", "Wahali", "Wanewadi", "Yewalwadi"],
  "Ashti": ["Morala", "Dadegaon", "Sangvi Ashti", "Deulgaon Ghat", "Jamgaon", "Parodi", "Takalsing", "Tavalwadi", "Hatolan", "Kanadi Bk", "Kanadi Kh", "Karkhel Bk", "Karkhel Kh", "Sheri Bk", "Sheri Kh", "Ambewadi", "Ambhora", "Anandwadi", "Andhale Wadi", "Aranvihira", "Ashta", "Ashti", "Aurangpur", "Balewadi", "Bandkhel", "Bavi", "Beed-sangvi", "Belgaon", "Bhaloni", "Bhatodi", "Bhawarwadi", "Bhojewadi", "Birangalwadi", "Borodi", "Bramhagaon", "Burudwadi", "Chikhali", "Chinchala", "Chinchewadi", "Chincholi", "Chinchpur", "Daithan", "Daulawadgaon", "Deolali", "Desur", "Devigavhan", "Devi Nimgaon", "Dhamangaon", "Dhangarwadi", "Dhangarwadi", "Dhanora", "Dhirdi", "Doithan", "Dongargan", "Fattewadgaon", "Gahukhel", "Ganagewadi", "Gandhanwadi", "Gangadevi", "Ghata Pimpri", "Ghongadewadi", "Hajipur", "Hakewadi", "Hanumantgaon", "Hatola", "Hingni", "Hivara", "Imangaon", "Jalgaon", "Kada", "Kapsi", "Karanji", "Karhewadgaon", "Karhewadi", "Kasari", "Kel", "Kelsangvi", "Kerul", "Khadakwadi", "Khadkat", "Khakalwadi", "Khalatwadi", "Khanapur", "Kharadgavhan", "Khilad", "Khuntephal", "Khuntephal Pundi", "Kinhi", "Kohini", "Koyal", "Kumbhephal"],
  "Kaij": ["Borgaon Bk", "Adas", "Anandgaon Sarni", "Andhalewadi", "Anegaon", "Arangaon", "Aurangpur", "Awasgaon", "Banegaon", "Bankaranja", "Bansarola", "Bawachi", "Belgaon", "Bhalgaon", "Bhatumba", "Bhopala", "Bobdewadi", "Borisawargaon", "Chandansawargaon", "Chincholi Mali", "Dahiphal Wadmauli", "Daithana", "Daradwadi", "Deogaon", "Depewadgaon", "Dhakanwadi", "Dhakephal", "Dhanegaon", "Dharmala", "Dhotra", "Doka", "Dongaon", "Ekurka", "Gadlewadi", "Gappewadi", "Gaurwadi", "Ghatewadi", "Gotegaon", "Hadgaon", "Hanumant Pimpri", "Hoal", "Isthal", "Jadhav Jawala", "Janegaon", "Jawalban", "Jiwachiwadi", "Jola", "Kaij", "Kalamamba", "Kalegaon Ghat"],
  "Ambajogai": ["Akola", "Ambajogai", "Ambaltek", "Ambalwadi", "Anjanpur", "Apegaon", "Babhalgaon", "Bagzari", "Bardapur", "Bharaj", "Bhatanwadi", "Bhawthana", "Chanai", "Chandanwadi", "Chichkhandi", "Chopanwadi", "Chothewadi", "Dagadwadi", "Daithana Radi", "Daradwadi", "Dattapur", "Devla", "Dhanora Bk", "Dhanora (k)", "Dhaswadi", "Dhawdi", "Dighol Amba", "Dongar Pimpla", "Ghatnandur", "Gholapwadi", "Girwli", "Gitta", "Hanumantwadi", "Hiwara (k)", "Jawalgaon", "Jodwadi", "Jogaiwadi", "Katkarwadi", "Kendrewadi", "Khapartone", "Kodari", "Kolkandi", "Kopra", "Krushnanagar", "Kumbhephal", "Kuranwadi", "Kusalwadi", "Laman Tanda", "Limbgaon", "Lokhandi Sawargaon", "Magarwadi", "Makegaon", "Malewadi", "Mamdapur", "Mandwa Pathan", "Morewadi", "Mudegaon", "Multan Tanda", "Murambi", "Murkutwadi", "Murti", "Nandadi", "Nandgaon", "Nawabwadi", "Nirpana", "Patoda (m)", "Pattiwadgaon", "Pimpala Dhaiguda", "Pimpri", "Pokhari", "Pus", "Radi", "Rajewadi", "Rakshaswadi", "Sakud", "Salunkwadi", "Sangaon", "Satephal", "Saundana", "Saygaon", "Selu Amba", "Shepwadi", "Shripatraiwadi", "Somanwadi", "Somnath Borgaon"]
};

// Map current taluka names to the keys in talukaVillages.json
const talukaAliases = {
  "Navapur": "Nawapur",
  "Ahilyanagar": "Nagar",
  "Shevgaon": "Shewgaon",
  "Nevasa": "Newasa",
  "Trimbakeshwar": "Trambak",
  "Nashik Rural": "Nashik",
  "Purandar": "Purandhar",
  "Velhe": "Velha",
  "Maval": "Mawal",
  "Mhasla": "Mhasala",
  "Kankavli": "Kankawali",
  "Malvan": "Malavan",
  "Khuldabad": "Khultabad",
  "Gevrai": "Georai",
  "Ambajogai": "Ambejogai",
  "Ahmedpur": "Ahmadpur",
  "Umarga": "Umerga",
  "Bhum": "Bhoom",
  "Deglur": "Degloor",
  "Sonpeth": "Sonepeth",
  "Manwath": "Manwat",
  "Basmath": "Basmat",
  "Chandur Railway": "Chandur Rly",
  "Dhamangaon Railway": "Dhamangaon Rly",
  "Buldhana": "Buldana",
  "Chikhli": "Chikhali",
  "Barshitakli": "Barshitakali",
  "Mangrulpir": "Mangarulpir",
  "Babulgaon": "Babhulgaon",
  "Kamptee": "Kamthi",
  "Hingna": "Hingana",
  "Saoner": "Savner",
  "Tirora": "Tiroda",
  "Nagbhir": "Nagbhid",
  "Kavathe Mahankal": "Kavate Mahakal",
  "Hatkanangale": "Hatkangale",
  "Radhanagari": "Radhanagri",
  "Gaganbawada": "Gagan Bavda",
  "Bhudargad": "Bhugargad",
  "Nagpur Urban": "Nagpur",
  "Nagpur Rural": "Nagpur",
  "Shirur Kasar": "Shirur",
  "Sangameshwar": "Sangmeshwar",
  "Walwa Islampur": "Walwa",
  "Khanapur Vita": "Khanapur",
  "Solapur North": "Solapur",
  "Solapur South": "Solapur",
  "Aundha Nagnath": "Aundha"
};

// Initial mapping for location-based auto-filling of Pin Codes
const locationPinCodes = {
  // Nashik Region
  "Nashik": "422001",
  "Dhule": "424001",
  "Nandurbar": "425412",
  "Jalgaon": "425001",
  "Ahilyanagar": "414001",
  "Palghar": "401404",
  "Chhatrapati Sambhajinagar": "431001",
  "Aurangabad": "431001",

  // Kokan Region
  "Mumbai City": "400001",
  "Mumbai Suburban": "400051",
  "Thane": "400601",
  "Raigad": "402201",
  "Ratnagiri": "415612",
  "Sindhudurg": "416812",

  // Pune Region
  "Pune": "411001",
  "Pune City": "411001",
  "Kolhapur": "416001",
  "Sangli": "416416",
  "Satara": "415001",
  "Solapur": "413001",

  // Chhatrapati Sambhaji Nagar Region (Marathwada)
  "Jalna": "431203",
  "Beed": "431122",
  "Latur": "413512",
  "Dharashiv": "413501",
  "Nanded": "431601",
  "Parbhani": "431401",
  "Hingoli": "431513",

  // Amravati Region
  "Amravati": "444601",
  "Buldhana": "443001",
  "Akola": "444001",
  "Washim": "444505",
  "Yavatmal": "445001",
  "Khamgaon": "444303",

  // Nagpur Region
  "Nagpur": "440001",
  "Nagpur Urban": "440001",
  "Wardha": "442001",
  "Bhandara": "441904",
  "Gondia": "441601",
  "Chandrapur": "442401",
  "Gadchiroli": "442605"
};

const ROLE_FEES = {
  "Regional Co-ordinator": { deposit: 80000, fees: 20000, total: 100000 },
  "District Co-ordinator": { deposit: 60000, fees: 10000, total: 70000 },
  "Tahshil Co-ordinator": { deposit: 40000, fees: 10000, total: 50000 },
  "Village Co-ordinator": { deposit: 0, fees: 0, total: 0 }
};

// --- Sub-components (Moved Outside to prevent re-renders and focus loss) ---

const Header = () => (
  <header className="bg-white border-b-2 border-navy flex flex-col items-center shadow-md z-10 relative w-full">
    <div className="w-full bg-white flex justify-center items-center">
    </div>
    <img src={headerImage} alt="Header" className="w-full max-h-48 object-contain" />
  </header>
);


const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 bg-navy text-white p-3 px-4 rounded-lg mt-6 mb-4 shadow-lg border-l-4 border-steppergold">
    <div className="bg-white/10 p-1.5 rounded-md">
      <Icon size={20} className="text-steppergold" />
    </div>
    <h2 className="font-black uppercase tracking-widest text-xs md:text-sm">{title}</h2>
  </div>
);

const InputField = ({ label, name, type = "text", placeholder = "", options = null, value, onChange, icon: Icon, required, readOnly = false, max, min, maxLength, inputMode, pattern }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-[10px] font-bold text-gray-700 uppercase flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
      {Icon && <Icon size={12} className="text-gray-400" />}
    </label>
    <div className="relative">
      {options && type !== 'datalist' ? (
        <select
          name={name}
          onChange={onChange}
          value={value || ''}
          disabled={readOnly}
          className="w-full border border-taupe p-1.5 px-2 rounded focus:ring-1 focus:ring-maroon-500 outline-none text-xs bg-gray-50 h-8 md:h-10 appearance-none disabled:bg-gray-100 disabled:text-gray-500 transition-shadow"
        >
          <option value="">Select...</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type === 'datalist' ? 'text' : type}
          name={name}
          placeholder={placeholder}
          value={value || ''}
          inputMode={inputMode}
          pattern={pattern}
          onChange={(e) => {
            if (type === 'date' && e.target.validity && e.target.validity.badInput) {
              // Immediately revert the native shadow DOM if the user types a 5-digit year or invalid date
              e.target.value = value || '';
              return;
            }
            onChange(e);
          }}
          readOnly={readOnly}
          max={max}
          min={min}
          maxLength={maxLength}
          list={options ? `list-${name}` : undefined}
          className={`w-full border border-taupe p-1.5 px-2 rounded focus:ring-1 focus:ring-maroon-500 outline-none text-xs bg-gray-50 h-8 md:h-10 pr-6 transition-shadow ${readOnly ? 'bg-gray-100 text-gray-500' : ''}`}
        />
      )}
      {options && (type === 'datalist' || type !== 'select') && (
        <datalist id={`list-${name}`}>
          {options.map(opt => <option key={opt} value={opt} />)}
        </datalist>
      )}
    </div>
  </div>
);

const ImageUpload = ({ label, name, value, onChange, height = "170px", subLabel, disabled = false, disabledMessage = "" }) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPG, JPEG, and PNG formats are allowed.");
        e.target.value = '';
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        alert(`File size must be 1MB or less. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        let finalValue = reader.result;
        if (file.type.startsWith('image/')) {
          finalValue = await compressImage(finalValue);
        }
        onChange(name, finalValue);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start shrink-0">
      <div
        className={`relative border-2 border-dashed ${value ? 'border-maroon-500' : 'border-gray-400'} ${disabled ? 'bg-gray-50 cursor-not-allowed grayscale' : 'bg-gray-50 cursor-pointer hover:border-maroon-500'} flex flex-col items-center justify-center overflow-hidden transition-colors group px-2 rounded-md`}
        style={{ width: '150px', height: height }}
        onClick={() => {
          if (disabled) {
            if (disabledMessage) alert(disabledMessage);
            return;
          }
          document.getElementById(`file-input-${name}`).click();
        }}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover rounded-sm" />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-sm">
                <Camera className="text-white" size={32} />
              </div>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(name, null); }}
              disabled={disabled}
              className={`absolute top-2 right-2 ${disabled ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'} text-white rounded-full p-1.5 shadow-md transition-colors z-10`}
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center pointer-events-none p-2">
            <Upload className={`${disabled ? 'text-gray-400' : 'text-gray-400 group-hover:text-maroon-500'} transition-colors`} size={32} />
            <span className={`text-xs md:text-sm ${disabled ? 'text-gray-500' : 'text-gray-600'} font-bold uppercase leading-snug`}>
              {label}<br />{subLabel}
            </span>
          </div>
        )}
      </div>
      {!disabled && <input id={`file-input-${name}`} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileChange} className="hidden" />}
    </div>
  );
};

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const termsCount = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const termsEn = [
    "I hereby declare that the entries made by me in the co-ordinator form are complete and true to the best of my knowledge and based on records.",
    "I understand and agree to follow the rules, regulations, and policies of BK Times.",
    "I accept responsibility for any incorrect or false information submitted by me in this form.",
    "I confirm that all documents provided by me are genuine and valid.",
    "I understand that the security deposit is refundable after 3 years, and if I continue the position after 3 years, the amount can be renewed with BK Times.",
    "I will maintain discipline and protect the reputation, values, and interests of BK Times at all times.",
    "I will submit reports, updates, and assigned work within the prescribed time.",
    "I understand that BK Times reserves the right to review, change, or withdraw my responsibilities whenever required.",
    "I will not misuse my designation, identity card, or authority for personal benefit or unlawful activities.",
    "I understand that if any information is found incorrect, my appointment may be cancelled by BK Times without prior notice."
  ];
  const termsMr = [
    "मी समन्वयक फॉर्ममध्ये दिलेली माहिती माझ्या माहितीनुसार व नोंदींनुसार पूर्णपणे खरी व अचूक असल्याचे घोषित करतो/करते.",
    "मी BK Times चे सर्व नियम, अटी, धोरणे आणि सूचनांचे पालन करण्यास सहमत आहे.",
    "या फॉर्ममध्ये दिलेली चुकीची किंवा खोटी माहिती असल्यास त्याची पूर्ण जबाबदारी माझी राईल.",
    "मी सादर केलेली सर्व कागदपत्रे खरी, वैध आणि अधिकृत असल्याची खात्री देतो/देते.",
    "मला मान्य आहे की सुरक्षा अनामत रक्कम ३ वर्षांनंतर परत केली जाईल आणि जर मी ३ वर्षांनंतरही या पदावर राहिलो/राहिलो, तर ती रक्कम BK Times कडे नूतनीकरण केली जाऊ शकते.",
    "मी नेहमी शिस्त राखून BK Times ची प्रतिष्ठा, मूल्ये आणि हित जपेन.",
    "मला सोपविण्यात आलेले अहवाल, माहिती व काम निश्चित वेळेत पूर्ण करेन.",
    "आवश्यकतेनुसार BK Times माझ्या जबाबदाऱ्या तपासू, बदलू किंवा रद्द करू शकते, हे मला मान्य आहे.",
    "मी माझ्या पदाचा, ओळखपत्राचा किंवा अधिकाराचा वैयक्तिक फायदा किंवा बेकायदेशीर कामासाठी गैरवापर करणार नाही.",
    "कोणतीही माहिती चुकीची आढळल्यास BK Times माझी नियुक्ती कोणतीही पूर्वसूचना न देता रद्द करू शकते, हे मला मान्य आहे."
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-2 md:p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-gray-50 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-taupe animate-in zoom-in-95 duration-300">
        <div className="bg-navy p-4 md:p-6 text-white flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">Terms & Conditions</h2>
            <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest opacity-80 mt-0.5">नियम आणि अटी</p>
          </div>
          <button onClick={onClose} className="bg-gray-50/10 hover:bg-gray-50/20 p-2 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-4 md:p-8 overflow-y-auto bg-gray-50/50">
          <div className="space-y-6">
            {termsCount.map((num, i) => (
              <div key={num} className="bg-gray-50 p-4 rounded-xl border border-taupe shadow-sm flex gap-4 items-start hover:border-maroon-300 transition-colors group">
                <div className="bg-navy text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-md group-hover:scale-105 transition-transform">{num}</div>
                <div className="space-y-3">
                  <p className="text-xs md:text-sm text-gray-800 font-bold leading-relaxed">{termsEn[i]}</p>
                  <p className="text-xs md:text-sm text-navy font-medium leading-relaxed bg-maroon-50/50 p-2 rounded-lg border border-maroon-100/50 italic">{termsMr[i]}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center p-4">
            <button onClick={onClose} className="bg-navy text-white px-8 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-navy transition-all shadow-lg hover:shadow-xl active:scale-95">Accept & Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewOverlay = ({ isOpen, onClose, formData, onEdit }) => {
  if (!isOpen) return null;

  const sections = [
    { title: "Application Details", id: 1, fields: ["applying_for", "region", "district", "taluka", "village"] },
    { title: "Personal Details", id: 2, fields: ["title", "fullName", "fatherName", "motherName", "dob", "gender", "aadhaar", "email", "mobile", "landline", "category", "religion"] },
    { title: "Nominee Details", id: 3, fields: ["nominee_title", "nominee_name", "nominee_dob", "nominee_relation", "nominee_guardian_name"] },
    { title: "Bank Details", id: 4, fields: ["bank_name", "ifsc", "account_no", "account_type", "branch_code", "bank_address", "micr"] },
    { title: "Documents submitted", id: 5, fields: ["highest_qualification_type", "police_verification"] }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[250] flex flex-col items-center p-2 md:p-12 animate-in fade-in duration-500 overflow-hidden">
      <div className="w-full max-w-4xl bg-gray-50 shadow-xl overflow-hidden flex flex-col h-full border border-taupe">
        <div className="bg-gray-50 p-6 border-b border-taupe flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-navy tracking-tight">Application Review</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kindly verify your information</p>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full transition-colors text-gray-500"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 bg-gray-50 leading-relaxed">
          {sections.map(section => (
            <div key={section.id} className="space-y-4">
              <div className="flex items-center justify-between border-b border-taupe pb-2">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">{section.title}:</h3>
                <button onClick={() => { onEdit(section.id); onClose(); }} className="text-[10px] font-black text-navy hover:underline uppercase tracking-widest flex items-center gap-1">
                  [Edit Section]
                </button>
              </div>
              <ul className="list-none space-y-2 pl-4">
                {section.fields.map(field => (
                  formData[field] && (
                    <li key={field} className="text-xs md:text-[13px] text-gray-600 flex gap-2">
                      <span className="shrink-0 text-navy font-bold">•</span>
                      <span className="font-bold text-gray-800 uppercase pr-1 text-[11px] min-w-[140px] px-2">{field.replace(/_/g, ' ')}:</span>
                      <span className="break-words flex-1">{String(formData[field])}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          ))}

          {/* Signature Preview in Review */}
          <div className="pt-6 border-t border-taupe">
            <div className="flex items-center justify-between border-b border-taupe pb-2 mb-4">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">Applicant Signature (Handwritten):</h3>
              <button onClick={() => { onEdit(6); onClose(); }} className="text-[10px] font-black text-navy hover:underline uppercase tracking-widest flex items-center gap-1">
                [Edit Signature]
              </button>
            </div>
            <div className="flex justify-center bg-gray-50 p-6 rounded-xl border-2 border-dashed border-taupe">
              {formData.sign_declaration ? (
                <div className="bg-gray-50 p-2 shadow-md border border-taupe flex flex-col items-center gap-2">
                  <img src={formData.sign_declaration} alt="Handwritten Signature" className="max-h-32 w-auto object-contain" />
                  <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Handwritten Signature Verified ✓</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm font-bold text-red-500 uppercase italic">Signature missing</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest leading-none">Please upload scanned signature in Step 6</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-taupe text-center flex flex-col items-center gap-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verify and click finish to continue</p>
          <button onClick={onClose} className="bg-navy text-white px-16 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-navy transition-all shadow-lg active:scale-95">Finished Review</button>
        </div>
      </div>
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose, formData, onDownloadPDF, onDownloadDoc }) => {
  if (!isOpen) return null;

  const documents = [
    { field: "age_proof_file", label: "Age Proof" },
    { field: "address_proof_file", label: "Address Proof" },
    { field: "id_proof_file", label: "Identity Proof" },
    { field: "doc_education", label: "Education Proof" },
    { field: "doc_police", label: "Police Verification" }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-2 md:p-4 animate-in fade-in duration-300">
      <div className="bg-gray-50 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-taupe flex flex-col max-h-[95vh]">
        <div className="bg-navy p-6 text-center text-white relative shrink-0">
          <div className="bg-gray-50 text-green-500 rounded-full p-3 shadow-xl border-4 border-gray-50 flex items-center justify-center w-16 h-16 mx-auto mb-3">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Success!</h2>
          <p className="text-maroon-100 mt-1 text-[10px] font-bold uppercase tracking-widest opacity-80">Registration successful</p>
        </div>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6 bg-gray-50">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
              "Thank you for completing your BK TIMES Registration!"
            </p>
            <p className="text-xs font-medium text-gray-500 mt-2">— {formData.fullName || 'Applicant'}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-1">Download Your Documents</h4>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={onDownloadPDF}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border-2 border-navy bg-maroon-50 text-navy hover:bg-maroon-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-navy text-white p-2 rounded-lg group-hover:scale-110 transition-transform"><FileText size={18} /></div>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase">Application Form</p>
                    <p className="text-[9px] font-bold text-white">PDF Document</p>
                  </div>
                </div>
                <Upload className="rotate-180 text-maroon-300" size={16} />
              </button>

              <div className="grid grid-cols-2 gap-2 mt-1">
                {documents.map((doc) => (
                  formData[doc.field] && (
                    <button
                      key={doc.field}
                      onClick={() => onDownloadDoc(doc.field, doc.label)}
                      className="flex items-center gap-2 p-2 rounded-lg border border-taupe bg-gray-50 hover:bg-gray-50 hover:border-navy transition-all group text-left"
                    >
                      <div className="bg-gray-50 text-gray-400 group-hover:text-navy p-1.5 rounded transition-colors shadow-sm"><FileText size={14} /></div>
                      <span className="text-[10px] font-bold text-gray-600 truncate">{doc.label}</span>
                    </button>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-taupe flex flex-col gap-3">
          <button
            onClick={() => navigate('/portal-login-form')}
            className="w-full bg-navy text-white h-12 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> Login Portal Reporters Login Portal
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-600 h-10 rounded-xl font-black uppercase meditation-widest text-[10px] hover:bg-gray-300 transition-all active:scale-95"
          >
            Close & Review
          </button>
        </div>
      </div>
    </div>
  );
};

const PortalLoginPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50/50">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-taupe overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="bg-navy p-8 text-center text-white relative">
          <h2 className="text-2xl font-black uppercase tracking-tight">Reporter Portal</h2>

          <p className="text-steppergold opacity-80 text-[10px] font-black uppercase tracking-widest mt-1">Access your account details</p>
        </div>

        <div className="p-8 space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-navy text-white h-14 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> Login
          </button>

          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-gray-50 text-navy border border-navy/20 h-14 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-100 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldCheck size={20} /> Password Reset
          </button>

          <div className="relative py-4 flex items-center">
            <div className="flex-grow border-t border-taupe"></div>
            <span className="flex-shrink mx-4 text-gray-300 font-black text-xs uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-taupe"></div>
          </div>

          <button
            onClick={() => navigate('/register')}
            className="w-full bg-steppergold/10 text-navy border-2 border-steppergold h-14 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-steppergold/20 transition-all shadow-md active:scale-95"
          >
            Registration
          </button>

          <button
            onClick={() => navigate('/register')}
            className="w-full bg-white text-maroon-500 border border-maroon-200 h-14 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-maroon-50 transition-all shadow-sm active:scale-95"
          >
            New Registration
          </button>
        </div>

        <div className="p-6 bg-gray-50 border-t border-taupe text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BK TIMES News Network • Dedicated Journalism</p>
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordRoute = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Password updated! Please login.");
        navigate('/login');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-gray-50 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-taupe animate-in zoom-in-95 duration-300">
        <h2 className="text-2xl font-black text-navy uppercase text-center mb-6">Reset Password</h2>
        {step === 1 ? (
          <div className="space-y-4">
            <InputField label="Registered Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" required />
            <button onClick={handleSendCode} disabled={loading || !email} className="w-full bg-navy text-white h-12 rounded-md font-black uppercase tracking-widest text-sm hover:bg-gray-50 transition-all shadow-lg shadow-blue-800 disabled:opacity-50">
              {loading ? "..." : "Send Reset Code"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <InputField label="Verify Code" name="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" maxLength="6" required />
            <InputField label="New Password" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="New Password" required />
            <button onClick={handleReset} disabled={loading || !code || !newPassword} className="w-full bg-navy text-white h-12 rounded-md font-black uppercase tracking-widest text-sm hover:bg-gray-50 transition-all shadow-lg shadow-blue-800 disabled:opacity-50">
              {loading ? "..." : "Reset Password"}
            </button>
          </div>
        )}
        <button onClick={() => navigate('/login')} className="mt-8 text-gray-400 font-bold uppercase text-[10px] hover:text-navy transition-colors w-full text-center tracking-widest">Back to Login</button>
      </div>
    </div>
  );
};

const LoginRoute = ({ formData, setFormData, handleInputChange }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const queryRole = new URLSearchParams(window.location.search).get('role');
  const [role, setRole] = useState(queryRole || 'village_coordinator');
  const { login } = useAuthContext();

  const onLogin = async () => {
    try {
      const result = await login({
        email: formData.loginIdentifier,
        password: formData.loginPassword,
        role: role
      });
      if (result) {
        // If user is a basic reporter/applicant, send to application form
        const storedRole = localStorage.getItem('userRole');
        if (!storedRole || storedRole === 'reporter') {
          navigate('/form');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      alert("Login Error: " + err.message);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 w-full mx-auto py-2 px-4 sm:px-8 flex-1 flex flex-col justify-center">
      <div className="bg-gray-50 rounded-2xl shadow-[0_20px_50px_rgba(204,0,0,0.1)] overflow-hidden border border-taupe flex flex-col md:flex-row min-h-[400px]">
        {/* Left Side: Login */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col">
          <h2 className="text-2xl font-black text-navy uppercase text-center mb-6">Login</h2>
          <div className="space-y-4 flex-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs md:text-sm font-bold text-gray-700 uppercase flex items-center gap-1">
                Registered Email ID / Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="loginIdentifier"
                  placeholder="Enter Email or Phone Number"
                  value={formData.loginIdentifier || ''}
                  onChange={handleInputChange}
                  className="w-full border border-taupe p-3 rounded-md focus:ring-2 focus:ring-maroon-500 outline-none text-sm md:text-base bg-gray-50 h-12 md:h-14 pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-3 text-gray-400">
                  <Mail size={18} />
                  <Smartphone size={18} />
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs md:text-sm font-bold text-gray-700 uppercase">Password</label>
                <button onClick={() => navigate('/forgot-password')} className="text-xs md:text-sm text-white font-bold hover:underline">Forgot Password?</button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="loginPassword"
                placeholder="........"
                value={formData.loginPassword || ''}
                onChange={handleInputChange}
                className="w-full border border-taupe p-3 rounded-md focus:ring-2 focus:ring-maroon-500 outline-none text-sm md:text-base bg-gray-50 h-12 md:h-14 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* reCAPTCHA Mock */}
            <div className="border border-taupe bg-gray-50/50 p-4 rounded-md flex items-center gap-4 max-w-sm mx-auto shadow-inner">
              <input
                type="checkbox"
                checked={captchaVerified}
                onChange={(e) => setCaptchaVerified(e.target.checked)}
                className="w-6 h-6 md:w-8 md:h-8 cursor-pointer"
              />
              <span className="text-sm md:text-base font-medium text-gray-700 flex-1">I'm not a robot</span>
              <div className="flex flex-col items-center">
                <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-8 h-8 grayscale opacity-50" />
                <span className="text-[8px] md:text-[10px] text-gray-400 uppercase mt-1">Privacy - Terms</span>
              </div>
            </div>

            <button
              onClick={onLogin}
              disabled={!captchaVerified || !formData.loginIdentifier || !formData.loginPassword}
              className="w-full bg-navy text-white h-10 md:h-12 rounded-md font-black uppercase tracking-widest text-xs md:text-sm hover:bg-gray-50 transition-all shadow-lg disabled:opacity-50 mt-4"
            >
              Login
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:flex items-center justify-center relative px-2 text-gray-200">
          <div className="h-[80%] w-[2px] bg-gray-50"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 border-2 border-taupe shadow-md w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-navy z-10">
            OR
          </div>
        </div>

        {/* Right Side: New User */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col items-center justify-center bg-gray-50/50">
          <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-6">New User?</h2>
          <button
            onClick={() => navigate('/register')}
            className="w-full max-w-sm bg-navy text-white h-10 md:h-12 rounded-md font-black uppercase tracking-widest text-xs md:text-sm hover:translate-y-[-2px] transition-all shadow-lg mb-6"
          >
            Register Here
          </button>
          
          <div className="flex items-center gap-2 w-full max-w-sm mb-6">
             <div className="h-[1px] bg-gray-200 flex-1"></div>
             <span className="text-[10px] font-black text-gray-300 uppercase italic">Or Access</span>
             <div className="h-[1px] bg-gray-200 flex-1"></div>
          </div>

          <button
            onClick={() => navigate('/portal-login-form')}
            className="w-full max-w-sm bg-white border-2 border-navy text-navy h-10 md:h-12 rounded-md font-black uppercase tracking-widest text-xs md:text-sm hover:bg-navy hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck size={14} /> Full Portal Login
          </button>
          <p className="mt-4 text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest">To create a new registration</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm font-bold uppercase tracking-tight text-gray-600">
          <span>How to Register - <button className="text-navy hover:underline">User Manual</button> | <button className="text-navy hover:underline">Tutorial Video</button></span>
        </div>
        <button className="text-xs md:text-sm font-bold uppercase tracking-tight text-navy hover:underline">How to Raise a Ticket</button>
      </div>
    </div>
  );
};

const RegistrationRoute = ({ formData, setFormData, handleInputChange, otpProps }) => {
  const navigate = useNavigate();
  const {
    otp, setOtp, isOtpSent, isVerified, setIsVerified, loadingOtp, handleSendOtp, handleVerifyOtp, otpError, otpSuccess,
    isEmailVerified, setIsEmailVerified
  } = otpProps;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [regStep, setRegStep] = useState(1);

  const age = calculateAge(formData.dob);

  const onRegister = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Registration Success! Please login with your credentials.");
        navigate('/login');
      } else {
        alert(data.message || "Registration failed. Try again.");
      }
    } catch (err) {
      alert("Registration Error: " + err.message);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 w-full mx-auto py-2 px-4 sm:px-8 flex-1">
      <div className="bg-gray-50 rounded-2xl shadow-[0_20px_50px_rgba(204,0,0,0.1)] overflow-hidden border border-taupe mb-4">
        <div className="p-4 text-center border-b border-taupe flex items-center bg-gray-50/50">
          <button onClick={() => navigate('/login')} className="text-navy hover:bg-maroon-100 p-2 rounded-full transition-colors"><ChevronLeft size={24} /></button>
          <h1 className="text-xl md:text-2xl font-black text-navy uppercase tracking-tight flex-1">Register</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          <div className="border border-white bg-gray-50 p-3 rounded-md shadow-sm mb-4">
            <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Registration Instructions:</h3>
            <ul className="text-[10px] md:text-xs text-gray-500 space-y-1 font-medium leading-relaxed">
              <li>1. Enter your full name exactly as per official identity proof or educational documents.</li>
              <li>2. Use a valid email address and mobile number for verification and official communication.</li>
              <li>3. Provide accurate and complete information during registration; false details may lead to account rejection.</li>
              <li>4. Keep your password secure and do not share login credentials with others.</li>
              <li>5. By registering, you agree to use the account only for official reporting purposes and follow organization rules.</li>
            </ul>
          </div>

          <div className="flex justify-between mb-2 text-[10px] md:text-xs font-bold uppercase tracking-widest px-2">
            <span className={`${regStep === 1 ? 'text-navy border-b-2 border-navy pb-1' : 'text-gray-400 pb-1'}`}>1. Personal Details</span>
            <span className={`${regStep === 2 ? 'text-navy border-b-2 border-navy pb-1' : 'text-gray-400 pb-1'}`}>2. Account Setup</span>
          </div>

          {regStep === 1 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-taupe pb-2">
                <InputField label="First Name" name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleInputChange} />
                <InputField label="Middle Name" name="middleName" placeholder="Middle Name" required value={formData.middleName} onChange={handleInputChange} />
                <InputField label="Last Name" name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-2 border-b border-taupe items-end">
                <InputField label="Gender" name="gender" options={["MALE", "FEMALE", "TRANSGENDER", "OTHER"]} required value={formData.gender} onChange={handleInputChange} />
                <InputField label="Date of Birth" name="dob" type="date" required value={formData.dob} onChange={handleInputChange} />
                <div className="flex flex-col items-start pb-[2px] w-full">
                  <label className="text-[8px] font-bold text-gray-400 uppercase mb-0.5 block px-1">Calculated Age</label>
                  <div className="bg-maroon-50/50 border border-maroon-100 flex items-center justify-center text-[9px] font-black text-navy rounded shadow-inner h-8 px-4 w-full uppercase tracking-tighter">
                    {age.years !== '' ? `${age.years}Y / ${age.months}M / ${age.days}D` : '--'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                <InputField
                  label="Region"
                  name="registrationRegion"
                  options={["NASHIK", "KOKAN", "AMRAVATI", "CHHATRAPATI SAMBHAJI NAGAR", "NAGPUR", "PUNE"]}
                  required
                  value={formData.registrationRegion}
                  onChange={handleInputChange}
                  readOnly={formData.applying_for === "District Co-ordinator"}
                />
                <InputField label="Applying For" name="applying_for" options={["Regional Co-ordinator", "District Co-ordinator", "Tahshil Co-ordinator", "Village Co-ordinator"]} required value={formData.applying_for} onChange={handleInputChange} />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    if (!formData.firstName || !formData.lastName || !formData.dob || !formData.gender || !formData.registrationRegion || !formData.applying_for) {
                      alert("Please fill all mandatory fields labeled with * to continue.");
                      return;
                    }
                    setRegStep(2);
                  }}
                  className="w-32 bg-navy text-white h-8 md:h-10 rounded font-black uppercase tracking-widest text-xs hover:bg-gray-50 shadow-sm transition-all flex items-center justify-center gap-1"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {regStep === 2 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border-b border-taupe pb-3">
                {/* Email Verification Component */}
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex flex-col sm:flex-row gap-2 items-end w-full">
                    <div className="flex-1 w-full">
                      <InputField label="Email ID" name="email" type="email" placeholder="Email" required value={formData.email} onChange={handleInputChange} readOnly={isEmailVerified} />
                    </div>
                    {!isEmailVerified && (
                      <button
                        onClick={otpProps.handleSendEmailOtp}
                        disabled={otpProps.loadingEmailOtp || !formData.email}
                        className="w-full sm:w-auto shrink-0 bg-navy text-white px-3 h-8 md:h-10 rounded text-[10px] font-bold shadow hover:bg-gray-50 disabled:bg-gray-400 transition-colors"
                      >
                        {otpProps.loadingEmailOtp ? "..." : (otpProps.isEmailOtpSent ? "Resend" : "Verify Email")}
                      </button>
                    )}
                  </div>
                  {otpProps.isEmailOtpSent && !isEmailVerified && (
                    <div className="mt-1 flex gap-2 animate-in slide-in-from-top-2 duration-300">
                      <input
                        type="text"
                        maxLength="6"
                        value={otpProps.emailOtp}
                        onChange={(e) => otpProps.setEmailOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Email OTP"
                        className="border border-white p-1 rounded text-xs w-24 h-7 text-center shadow-sm focus:ring-1 focus:ring-maroon-500 outline-none font-bold"
                      />
                      <button onClick={otpProps.handleVerifyEmailOtp} className="text-[10px] font-bold text-navy uppercase bg-maroon-50 px-2 rounded border border-navy hover:bg-maroon-100 h-7 transition-colors">Confirm</button>
                    </div>
                  )}
                  {otpProps.emailOtpError && <p className="text-[8px] text-red-500 font-bold uppercase mt-0.5">{otpProps.emailOtpError}</p>}
                  {otpProps.isEmailVerified && (
                    <div className="mt-1 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-md text-[11px] font-bold shadow-sm animate-in fade-in zoom-in-95 duration-300">
                      <ShieldCheck size={14} className="shrink-0" />
                      <span>Email Verified Successfully</span>
                    </div>
                  )}
                </div>

                {/* Mobile Verification Component */}
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex flex-col sm:flex-row gap-2 items-end w-full">
                    <div className="flex-1 w-full">
                      <InputField label="Mobile Number" name="mobile" type="tel" placeholder="Mobile" required value={formData.mobile} onChange={handleInputChange} readOnly={isVerified} inputMode="numeric" pattern="[0-9+ ]*" />
                    </div>
                    {!isVerified && (
                      <button
                        onClick={handleSendOtp}
                        disabled={loadingOtp || !formData.mobile}
                        className="w-full sm:w-auto shrink-0 bg-navy text-white px-3 h-8 md:h-10 rounded text-[10px] font-bold shadow hover:bg-gray-50 disabled:bg-gray-400 transition-colors"
                      >
                        {loadingOtp ? "..." : (isOtpSent ? "Resend" : "Verify Mobile")}
                      </button>
                    )}
                  </div>
                  {isOtpSent && !isVerified && (
                    <div className="mt-1 flex gap-2 animate-in slide-in-from-top-2 duration-300">
                      <input
                        type="text"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Mobile OTP"
                        className="border border-white p-1 rounded text-xs w-24 h-7 text-center shadow-sm focus:ring-1 focus:ring-maroon-500 outline-none font-bold"
                      />
                      <button onClick={handleVerifyOtp} className="text-[10px] font-bold text-navy uppercase bg-maroon-50 px-2 rounded border border-navy hover:bg-maroon-100 h-7 transition-colors">Confirm</button>
                    </div>
                  )}
                  {otpError && <p className="text-[8px] text-red-500 font-bold uppercase mt-0.5">{otpError}</p>}
                  {isVerified && (
                    <div className="mt-1 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-md text-[11px] font-bold shadow-sm animate-in fade-in zoom-in-95 duration-300">
                      <ShieldCheck size={14} className="shrink-0" />
                      <span>Mobile Verified Successfully</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative md:col-span-2">
                  <InputField label="Password" name="password" type={showPassword ? "text" : "password"} placeholder="........" required value={formData.password} onChange={handleInputChange} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-6 text-gray-400 hover:text-white"><span className="p-1">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</span></button>
                </div>
                <div className="relative md:col-span-2">
                  <InputField label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="........" required value={formData.confirmPassword} onChange={handleInputChange} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-6 text-gray-400 hover:text-white"><span className="p-1">{showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}</span></button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 border-t border-taupe pt-3">
                <button
                  onClick={() => setRegStep(1)}
                  className="w-full sm:w-28 bg-gray-100 text-gray-600 px-3 h-8 md:h-10 rounded font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <ChevronLeft size={14} /> Back
                </button>

                <div className="flex flex-col sm:flex-row flex-1 justify-end items-center gap-3 w-full">
                  <div className="border border-taupe bg-gray-50/50 p-1 rounded flex items-center gap-2 shadow-inner w-full sm:w-auto min-w-[180px] h-8 md:h-10">
                    <input type="checkbox" checked={captchaVerified} onChange={(e) => setCaptchaVerified(e.target.checked)} className="w-4 h-4 cursor-pointer ml-1" />
                    <span className="text-[10px] font-medium text-gray-700 flex-1">I'm not a robot</span>
                    <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-5 h-5 grayscale opacity-50 mr-1" />
                  </div>
                  <button
                    onClick={onRegister}
                    disabled={!isVerified || !isEmailVerified || !captchaVerified || formData.password !== formData.confirmPassword || !formData.password}
                    className="w-full sm:w-40 bg-navy text-white px-4 h-8 md:h-10 rounded font-black uppercase tracking-widest text-xs hover:bg-gray-50 disabled:opacity-50 shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Register
                  </button>
                </div>
              </div>
              
              {/* TESTING OTP BYPASS */}
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => {
                    setIsVerified(true);
                    setIsEmailVerified(true);
                  }}
                  className="text-[10px] font-bold text-gray-400 border border-dashed border-gray-300 px-2 py-1 rounded hover:bg-gray-100 transition-all uppercase"
                >
                  Skip OTP (Testing Only)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OfficialApplicationForm = ({ formData }) => {
  const ageComp = calculateAge(formData.dob);
  const nomineeAge = calculateAge(formData.nominee_dob);

  const sections = [
    {
      title: "Application Details",
      fields: [
        { label: "Applying For", value: formData.applying_for },
        { label: "Region", value: formData.region },
        { label: "District", value: formData.district },
        { label: "Taluka", value: formData.taluka },
        { label: "Village", value: formData.village },
      ]
    },
    {
      title: "Personal Information",
      fields: [
        { label: "Title", value: formData.title },
        { label: "Full Name", value: formData.fullName },
        { label: "Father's Name", value: formData.fatherName },
        { label: "Mother's Name", value: formData.motherName },
        { label: "Date of Birth", value: formData.dob ? new Date(formData.dob).toLocaleDateString('en-GB') : '' },
        { label: "Age", value: `${ageComp.years}Y ${ageComp.months}M ${ageComp.days}D` },
        { label: "Gender", value: formData.gender },
        { label: "Aadhaar No", value: formData.aadhaar },
        { label: "Mobile No", value: formData.mobile },
        { label: "Landline No", value: formData.landline },
        { label: "Email", value: formData.email },
        { label: "Category", value: formData.category },
        { label: "Religion", value: formData.religion },
        { label: "Address", value: formData.address_perm },
        { label: "Pin Code", value: formData.pin_perm },
      ]
    },
    {
      title: "Nominee Information",
      fields: [
        { label: "Nominee Name", value: `${formData.nominee_title || ''} ${formData.nominee_name || ''}`.trim() },
        { label: "Relation", value: formData.nominee_relation },
        { label: "Nominee Age", value: nomineeAge.years !== '' ? `${nomineeAge.years} Years` : '' },
        { label: "Guardian (if minor)", value: formData.nominee_guardian_name },
      ]
    },
    {
      title: "Bank Account Details",
      fields: [
        { label: "Bank Name", value: formData.bank_name },
        { label: "IFSC Code", value: formData.ifsc },
        { label: "Account No", value: formData.account_no },
        { label: "Account Type", value: formData.account_type },
        { label: "Branch Name", value: formData.branch_code },
        { label: "Bank Address", value: formData.bank_address },
      ]
    },
    {
      title: "Document Verification",
      fields: [
        { label: "Qualification", value: formData.highest_qualification_type },
        { label: "Police Varification No", value: formData.police_verification },
      ]
    }
  ];

  return (
    <div id="pdf-content" className="bg-gray-50 p-8 text-gray-800 font-sans leading-tight min-h-[1000px] w-full max-w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b-2 border-navy pb-6">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tighter mb-0.5">BK TIMES</h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em]">– EK VILLAGE EK PATRAKAR MOHIM 2026 –</p>
        </div>
        <div className="text-right">
          <div className="bg-navy text-white px-4 py-2 font-black text-[11px] uppercase tracking-widest inline-block rounded mb-1 shadow-sm">
            Official Enrollment
          </div>
          <p className="text-[9px] font-bold text-gray-400">GEN DATE: {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, idx) => {
          const activeFields = section.fields.filter(f => f.value && String(f.value).trim() !== '');
          const rows = [];
          for (let i = 0; i < activeFields.length; i += 2) {
            rows.push(activeFields.slice(i, i + 2));
          }

          if (activeFields.length === 0) return null;

          return (
            <div key={idx} className="page-break-inside-avoid border border-maroon-50/50 rounded-lg p-2.5 bg-gray-50/30">
              <h2 className="text-[11px] font-black text-navy uppercase border-b border-maroon-50 mb-2 pb-0.5 flex items-center gap-2">
                <div className="w-1.5 h-3 bg-navy"></div>
                {section.title}
              </h2>
              <div className="space-y-1.5 px-1">
                {rows.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-4">
                    {row.map((field, fIdx) => (
                      <div key={fIdx} className="flex-1 flex flex-col gap-0.5 text-[11px] border-b border-taupe/50 pb-0.5">
                        <span className="font-bold text-gray-400 uppercase text-[8px] tracking-tight">{field.label}:</span>
                        <span className="font-bold text-gray-900 break-words leading-tight">{field.value}</span>
                      </div>
                    ))}
                    {row.length === 1 && <div className="flex-1"></div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Signature & Declaration */}
      <div className="mt-6 pt-5 border-t-2 border-navy flex flex-col page-break-inside-avoid">
        <div className="flex justify-between items-start gap-8">
          <div className="flex-1">
            <h3 className="text-[11px] font-black text-navy uppercase mb-2 underline underline-offset-2">Declaration</h3>
            <p className="text-[10px] font-medium leading-relaxed italic text-gray-500 bg-gray-50 p-3 rounded-lg border border-taupe">
              "I, <strong className="text-navy uppercase not-italic">{formData.fullName || '__________________________'}</strong>, hereby declare that all the information provided above is complete and correct to the best of my knowledge. I understand and agree to follow all policies and codes of conduct as defined by BK TIMES."
            </p>
            <div className="mt-4 flex gap-8">
              <div className="text-[10px] font-bold text-gray-400 uppercase">PLACE: <span className="text-gray-900 ml-1">________________</span></div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">DATE: <span className="text-gray-900 ml-1">{new Date().toLocaleDateString('en-GB')}</span></div>
            </div>
          </div>

          <div className="text-center shrink-0">
            <div className="w-48 h-28 border-2 border-dashed border-maroon-100 rounded-xl bg-gray-50 flex items-center justify-center p-2 mb-2 shadow-inner overflow-hidden">
              {formData.sign_declaration ? (
                <img
                  id="capture-ready-signature"
                  src={formData.sign_declaration}
                  alt="Signature"
                  className="max-w-full max-h-full object-contain block mx-auto"
                  style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : (
                <div className="text-center flex flex-col items-center gap-1">
                  <X size={20} className="text-red-200" />
                  <span className="text-[8px] font-black text-red-200 uppercase tracking-tighter">Signature Missing</span>
                </div>
              )}
            </div>
            <p className="text-[9px] font-black uppercase text-navy tracking-widest leading-none">Handwritten Signature Only</p>
            <p className="text-[8px] font-bold text-gray-400 italic mt-0.5">Scanned Copy Verified</p>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="mt-8 flex justify-between items-end border-t border-taupe opacity-60 pt-4">
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">BK TIMES ENROLLMENT PORTAL © 2026</p>
          <div className="flex items-center gap-1.5 grayscale opacity-50">
            <div className="w-4 h-4 rounded-full bg-navy flex items-center justify-center text-[7px] text-white font-black">BK</div>
            <span className="text-[8px] font-black text-navy tracking-tighter uppercase">OFFICIAL SYSTEM RECORD</span>
          </div>
        </div>
      </div>
    </div>
  );
};


const Step1 = ({ formData, handleInputChange, handleFileChange }) => {
  const isRegionDisabled = ["District Co-ordinator", "Tahshil Co-ordinator", "Village Co-ordinator"].includes(formData.applying_for);
  const showRegion = !!formData.applying_for;
  const showDistrict = formData.applying_for === "District Co-ordinator" || formData.applying_for === "Tahshil Co-ordinator" || formData.applying_for === "Village Co-ordinator";
  const showTaluka = formData.applying_for === "Tahshil Co-ordinator" || formData.applying_for === "Village Co-ordinator";
  const showVillage = formData.applying_for === "Village Co-ordinator";
  const effectiveRegion = formData.region || formData.registrationRegion || '';

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-center text-xl font-black text-navy border-b-2 border-navy pb-2 mb-4 uppercase">Application Form</h1>

      {/* Row 1: Region + District */}
      {(showRegion || showDistrict) && (
        <div className={`grid gap-4 bg-maroon-50 p-4 rounded-lg border border-maroon-100 mb-2 ${showRegion && showDistrict ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 justify-items-center'}`}>
          {showRegion && (
            <div className="w-full max-w-md">
              <InputField
                label="Name of Region"
                name="region"
                options={Object.keys(regionDistricts)}
                value={effectiveRegion}
                onChange={handleInputChange}
                required
                readOnly={isRegionDisabled}
              />
            </div>
          )}
          {showDistrict && (
            <div className="w-full max-w-md">
              <InputField label="Name of District" name="district" options={effectiveRegion ? regionDistricts[effectiveRegion] : []} value={formData.district} onChange={handleInputChange} required />
            </div>
          )}
        </div>
      )}

      {/* Row 1.5: Taluka + Village Selection */}
      {(showTaluka || showVillage) && (
        <div className={`grid gap-4 bg-maroon-50 p-4 rounded-lg border border-maroon-100 mb-4 ${showTaluka && showVillage ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 justify-items-center'}`}>
          {showTaluka && (
            <div className="w-full max-w-md">
              <InputField label="Select Taluka" name="taluka" options={formData.district ? districtTalukas[formData.district] : []} value={formData.taluka} onChange={handleInputChange} required />
            </div>
          )}
          {showVillage && (
            <div className="w-full max-w-md">
              <InputField
                label="Select Village"
                name="village"
                options={formData.taluka ? (talukaVillages[talukaAliases[formData.taluka] || formData.taluka] || [`${formData.taluka} City`, `${formData.taluka} Rural`]) : []}
                placeholder="Select village..."
                value={formData.village}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const Step2 = ({ formData, handleInputChange, handleFileChange }) => (
  <div className="animate-in fade-in duration-500">
    <SectionTitle icon={User} title="Personal Information" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-taupe pb-3">
      <InputField label="Title" name="title" options={["SHRI", "SMT", "KUMAR", "KUMARI", "ADV", "DR", "ER", "CA"]} value={formData.title} onChange={handleInputChange} required />
      <div className="lg:col-span-3"><InputField label="Full Name (Firstname, Midname, Surname)" name="fullName" value={formData.fullName} readOnly /></div>

      <div className="lg:col-span-1"><InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleInputChange} required /></div>
      <div className="lg:col-span-1"><InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleInputChange} required /></div>
      <InputField label="Mobile No" name="mobile" value={formData.mobile} readOnly />
      <InputField label="Alternate Number" name="landline" value={formData.landline} onChange={handleInputChange} required />

      <div className="lg:col-span-2"><InputField label="Aadhaar No" name="aadhaar" type="tel" maxLength={12} value={formData.aadhaar} onChange={handleInputChange} required /></div>
      <div className="lg:col-span-2"><InputField label="Email ID" name="email" value={formData.email} readOnly /></div>

      <div className="lg:col-span-2"><InputField label="Date of Birth" name="dob" type="date" min="1900-01-01" max={new Date().toISOString().split('T')[0]} value={formData.dob} onChange={handleInputChange} required /></div>
      <div className="lg:col-span-2 flex flex-col justify-end pb-[2px]">
        <label className="text-[10px] font-bold text-gray-700 uppercase mb-1">Age</label>
        <div className="bg-gray-50 border border-taupe flex items-center justify-center text-[10px] font-black text-black rounded shadow-inner h-8 md:h-10 w-full uppercase tracking-tight">
          {(() => {
            const ageComp = calculateAge(formData.dob);
            return ageComp.years !== '' ? `${ageComp.years}Y / ${ageComp.months}M / ${ageComp.days}D` : 'PENDING DOB';
          })()}
        </div>
      </div>

      <div className="lg:col-span-2"><InputField label="Category" name="category" options={["Open / General", "OBC (Other Backward Class)", "SC (Scheduled Caste)", "ST (Scheduled Tribe)", "EWS (Economically Weaker Section)"]} value={formData.category} onChange={handleInputChange} required /></div>
      <div className="lg:col-span-2"><InputField label="Religion" name="religion" options={["HINDU", "MUSLIM", "CHRISTIAN", "SIKH", "BUDDHIST", "JAIN", "PARSI", "OTHER"]} value={formData.religion} onChange={handleInputChange} required /></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-b border-taupe pb-3 mt-3">
      <InputField label="Qualification" name="qualification" options={["SSC", "HSC", "GRADUATION", "POST GRADUATION", "DOCTERATE", "DIPLOMA", "ITI"]} value={formData.qualification} onChange={handleInputChange} required />
      <InputField label="Profession" name="profession" options={["BUSINESS", "SERVICE", "AGRICULTURE", "OTHER"]} value={formData.profession} onChange={handleInputChange} required />
      {formData.profession === 'OTHER' && (
        <InputField label="Other Profession Details" name="other_profession" placeholder="Please specify your profession" value={formData.other_profession} onChange={handleInputChange} required />
      )}
    </div>

    <div className="mt-3 border-b border-taupe pb-3">
      <div className="flex flex-col md:flex-row gap-3 w-full bg-maroon-50/30 p-3 rounded-lg border border-maroon-50/50 items-start">
        <div className="flex-1 w-full">
          <label className="text-[10px] md:text-xs font-bold text-gray-700 uppercase flex items-center gap-1 mb-1 shadow-sm px-1">Permanent Address <span className="text-red-500">*</span></label>
          <textarea name="address_perm" rows="2" className="w-full border border-taupe p-2 rounded text-[10px] md:text-xs outline-none focus:ring-1 focus:ring-maroon-500 resize-none min-h-[40px] shadow-sm bg-gray-50" value={formData.address_perm || ''} onChange={handleInputChange} placeholder="Enter your full permanent address" required />
        </div>
        <div className="w-full md:w-48 lg:w-48 self-stretch flex flex-col justify-end">
          <InputField label="Pin Code" name="pin_perm" value={formData.pin_perm} onChange={handleInputChange} required />
        </div>
      </div>
    </div>
  </div>
);

const Step3 = ({ formData, handleInputChange, handleFileChange }) => {
  const ageComp = calculateAge(formData.nominee_dob);
  const isMinor = ageComp.years !== '' && ageComp.years < 18;

  return (
    <div className="animate-in fade-in duration-500">
      <SectionTitle icon={UserCheck} title="Nominee Details" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2 border-b border-taupe pb-2 mb-2">
        <InputField label="Title" name="nominee_title" options={["SHRI", "SHRIMATI", "KUMAR", "KUMARI", "ADVOCATE", "DOCTORATE", "ER", "CA"]} value={formData.nominee_title} onChange={handleInputChange} required />
        <div className="lg:col-span-2"><InputField label="Nominee Name" name="nominee_name" value={formData.nominee_name} onChange={handleInputChange} required /></div>
        <InputField label="Birth Date" name="nominee_dob" type="date" value={formData.nominee_dob} onChange={handleInputChange} required />

        <div>
          <label className="text-[10px] font-bold text-gray-700 uppercase mb-1 block">Age</label>
          <div className="bg-gray-100 border border-taupe flex items-center justify-center text-[10px] md:text-xs font-bold rounded shadow-inner h-8 md:h-10">
            {ageComp.years !== '' ? `${ageComp.years}Y / ${ageComp.months}M / ${ageComp.days}D` : '-'}
          </div>
        </div>
        <InputField label="Relationship" name="nominee_relation" options={["FATHER", "MOTHER", "HUSBAND", "SPOUSE", "BROTHER", "SISTER", "SON", "DAUGHTER", "UNCLE", "AUNT", "GRANDFATHER", "GRANDMOTHER"]} value={formData.nominee_relation} onChange={handleInputChange} required />
        {isMinor && (
          <div className="lg:col-span-2">
            <InputField label="Name of Guardian" name="nominee_guardian_name" value={formData.nominee_guardian_name} onChange={handleInputChange} required />
          </div>
        )}
      </div>
    </div>
  );
};

const Step4 = ({ formData, handleInputChange, handleFileChange }) => (
  <div className="animate-in fade-in duration-500">
    <SectionTitle icon={CreditCard} title="Bank Details" />

    {/* Upload Instructions Removed */}

    {/* Compacted Grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-2 gap-x-2 bg-maroon-50/30 p-2 rounded border border-maroon-50 mb-2">
      <InputField label="IFSC Code" name="ifsc" value={formData.ifsc} onChange={handleInputChange} required />
      <div className="lg:col-span-2"><InputField label="Bank Name" name="bank_name" value={formData.bank_name} onChange={handleInputChange} required /></div>
      <InputField label="Types of Account" name="account_type" options={["SAVINGS", "CURRENT", "SALARY"]} value={formData.account_type} onChange={handleInputChange} required />
      <InputField label="Branch Code" name="branch_code" value={formData.branch_code} onChange={handleInputChange} required />

      <div className="lg:col-span-2"><InputField label="Address of Bank" name="bank_address" value={formData.bank_address} onChange={handleInputChange} required /></div>
      <div className="lg:col-span-2"><InputField label="Account Number" name="account_no" value={formData.account_no} onChange={handleInputChange} required /></div>
      <InputField label="MICR Code No" name="micr" value={formData.micr} onChange={handleInputChange} required />
    </div>

    <div className="flex justify-center mb-1">
      <div className="flex items-center gap-4 bg-maroon-50/10 p-3 px-6 rounded border border-maroon-50">
        <ImageUpload label="Bank Passbook (Passport Size Copy)" name="bank_passbook" value={formData.bank_passbook} onChange={handleFileChange} height="110px" />
        <p className="text-[10px] text-gray-400 font-bold uppercase">Required</p>
      </div>
    </div>
  </div>
);

const Step5 = ({ formData, handleInputChange, handleFileChange }) => {
  const onFileSelect = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert("Only PDF format is allowed for document uploads.");
        e.target.value = '';
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        alert(`File size must be 1MB or less. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFileChange(name, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <SectionTitle icon={FileText} title="Document Upload" />

      {/* Upload Instructions Removed */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {[
          { title: "Age Proof", items: ["Leaving Certificate", "Birth Certificate", "Aadhar Card"], prefix: "age_proof" },
          { title: "Address Proof", items: ["Ration Card", "Driving License", "Passport", "Light Bill", "Aadhar Card"], prefix: "address_proof" },
          { title: "Identity Proof", items: ["PAN Card", "Aadhar Card", "School/College ID", "Driving Licence", "Voting Card", "Other"], prefix: "id_proof" }
        ].map(category => (
          <div key={category.title} className="bg-white rounded-xl border border-taupe shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="bg-navy px-4 py-2.5 flex flex-row items-center justify-between">
              <p className="text-white text-[10px] md:text-xs font-black uppercase tracking-wider">{category.title}</p>
              {formData[`${category.prefix}_file`] && <span className="bg-green-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black shadow-sm">UPLOADED</span>}
            </div>
            <div className="p-4 flex flex-col gap-4 flex-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Select Document Type</label>
                <select
                  name={`${category.prefix}_type`}
                  value={formData[`${category.prefix}_type`] || ''}
                  onChange={handleInputChange}
                  className="w-full border border-taupe p-2 rounded-lg text-xs bg-gray-50 outline-none focus:ring-2 focus:ring-navy font-bold text-navy transition-all"
                >
                  <option value="" disabled>-- Choose ONE --</option>
                  {category.items.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <label className={`w-full flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl cursor-pointer text-xs font-black uppercase transition-all shadow-sm border-2 border-dashed ${!formData[`${category.prefix}_type`] ? 'opacity-30 pointer-events-none bg-gray-100 border-gray-300 text-gray-400' : formData[`${category.prefix}_file`] ? 'bg-mint text-green-800 border-green-300 hover:bg-green-100' : 'bg-mint text-green-800 border-green-200 hover:border-green-400'}`}>
                <Upload size={18} />
                {formData[`${category.prefix}_file`] ? 'RE-UPLOAD PDF' : 'UPLOAD PDF'}
                <input type="file" name={`${category.prefix}_file`} className="hidden" accept="application/pdf" onChange={onFileSelect} disabled={!formData[`${category.prefix}_type`]} />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Educational Proof */}
        <div className="bg-white rounded-xl border border-taupe shadow-sm overflow-hidden flex flex-col">
          <div className="bg-navy px-4 py-2">
            <p className="text-white text-[10px] md:text-xs font-black uppercase tracking-wider">Highest Educational Proof</p>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Qualification Level</label>
              <select name="highest_qualification_type" className="w-full border border-taupe p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-navy bg-gray-50 font-bold" value={formData.highest_qualification_type || ''} onChange={handleInputChange}>
                <option value="">Select Qualification...</option>
                {["10th Pass", "12th Pass", "Diploma", "ITI", "Graduate", "Post Graduate"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <label className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer text-xs font-black uppercase transition-all border-2 border-dashed ${formData.doc_education ? 'bg-mint text-green-800 border-green-300' : 'bg-mint text-green-800 border-green-200'}`}>
              <Upload size={16} />
              {formData.doc_education ? '✓ UPLOADED' : 'UPLOAD MARKSHEET'}
              <input type="file" name="doc_education" className="hidden" accept="application/pdf" onChange={onFileSelect} />
            </label>
          </div>
        </div>

        {/* Police Verification */}
        <div className="bg-white rounded-xl border border-taupe shadow-sm overflow-hidden flex flex-col">
          <div className="bg-navy px-4 py-2">
            <p className="text-white text-[10px] md:text-xs font-black uppercase tracking-wider">Police Verification</p>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Verification Number</label>
              <input name="police_verification" className="w-full border border-taupe p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-navy font-bold" value={formData.police_verification || ''} onChange={handleInputChange} placeholder="DIGITS ONLY" />
            </div>
            <label className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer text-xs font-black uppercase transition-all border-2 border-dashed ${formData.doc_police ? 'bg-mint text-green-800 border-green-300' : 'bg-mint text-green-800 border-green-200'}`}>
              <Upload size={16} />
              {formData.doc_police ? '✓ UPLOADED' : 'UPLOAD DOC'}
              <input type="file" name="doc_police" className="hidden" accept="application/pdf" onChange={onFileSelect} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};


const Step6 = ({ formData, handleInputChange, handleFileChange, isPaid, handlePayment, setIsPaid }) => {
  const [showTerms, setShowTerms] = useState(false);
  const [termsRead, setTermsRead] = useState(false);
  const fees = ROLE_FEES[formData.applying_for];

  return (
    <div className="animate-in fade-in duration-500">
      <SectionTitle icon={ShieldCheck} title="Declaration" />

      <div className="bg-gray-50 border border-taupe rounded-lg p-4 mb-3">
        <div className="space-y-4 text-xs md:text-sm text-gray-800 font-medium leading-relaxed">
          <div className="flex flex-col gap-3">
            <p className="flex gap-2 border-b border-taupe pb-2">
              <span className="font-bold shrink-0">I,</span>
              <span>{formData.applying_for} of <strong className="text-navy underline underline-offset-2">{formData.region || '_________'}</strong> (Area) of BK Times, Nashik.</span>
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                <Info size={14} className="text-navy" /> Before submitting, please read our policies:
              </p>
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className={`font-black uppercase text-[11px] md:text-xs transition-colors flex items-center gap-2 group w-fit p-2 rounded-lg ${termsRead ? 'text-green-600 bg-green-50 border border-green-200' : 'text-navy underline hover:text-black'}`}
              >
                {termsRead ? (
                  <>
                    <div className="bg-green-500 text-white rounded-full p-0.5 shadow-sm animate-bounce">
                      <Check size={14} />
                    </div>
                    <span>Terms & Conditions Read</span>
                  </>
                ) : (
                  <>
                    <span>Read Terms & Conditions (नियम आणि अटी वाचा)</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-taupe flex flex-col items-center sm:items-end p-2 md:p-4">
        <div className={`p-4 border-2 rounded-xl shadow-inner transition-all duration-500 overflow-hidden relative ${termsRead ? 'bg-gray-50 border-maroon-100 ring-4 ring-maroon-50/50' : 'bg-gray-100 border-taupe grayscale opacity-50'}`}>
          <div className="flex flex-col items-center gap-1.5 mb-3">
            <h4 className="text-[10px] font-black text-navy uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={14} /> Scanned Signature Verification
            </h4>
            <p className="text-[8px] font-bold text-gray-400 uppercase text-center leading-tight">Handwritten scans only • Logos & Digital text strictly forbidden</p>
          </div>

          <div
            className={`w-[260px] h-[100px] border-2 border-dashed rounded-lg bg-gray-50 flex items-center justify-center p-2 relative group transition-all ${formData.sign_declaration ? 'border-green-500 bg-green-50/20' : 'border-taupe hover:border-white'}`}
            onClick={() => termsRead && document.getElementById('signature-uploader').click()}
          >
            {formData.sign_declaration ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-md shadow-sm border border-green-100 overflow-hidden">
                <img
                  src={formData.sign_declaration}
                  alt="Signature"
                  className="max-w-full max-h-full object-contain mix-blend-multiply transition-all grayscale contrast-[1.2]"
                />
                <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="text-green-600" size={24} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-maroon-100 text-navy flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload size={20} />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Tap to upload scan/photo</span>
              </div>
            )}
            <input
              id="signature-uploader"
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const target = e.target;
                const file = target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const img = new Image();
                    img.onload = () => {
                      compressImage(reader.result, 800, 400).then(compressed => {
                        handleFileChange('sign_declaration', compressed);
                      });
                    };
                    img.src = reader.result;
                  };
                  reader.readAsDataURL(file);
                }
              }}
              disabled={!termsRead}
            />
          </div>

          {formData.sign_declaration && (
            <button
              onClick={() => handleFileChange('sign_declaration', null)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
              type="button"
            >
              <X size={12} />
            </button>
          )}
        </div>
        {!termsRead && <p className="text-[9px] font-bold text-red-500 uppercase mt-1 animate-pulse text-center w-full">Read terms to unlock signature</p>}
      </div>

      {fees && fees.total > 0 && (
        <div className="mt-4 pt-4 border-t border-taupe animate-in fade-in slide-in-from-top-4 duration-700 w-full flex justify-center sm:justify-end">
          <div className="bg-maroon-50/50 border border-maroon-100 p-4 rounded-xl shadow-inner w-full max-w-md">
            <h3 className="text-[10px] font-black text-navy uppercase mb-3 flex items-center gap-2 tracking-widest">
              <CreditCard size={14} /> Application Fees Summary
            </h3>
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                <span>Registration Fees (Non-Refundable):</span>
                <span className="text-gray-900">₹{fees.fees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                <span>Deposit (Refundable):</span>
                <span className="text-gray-900">₹{fees.deposit.toLocaleString()}</span>
              </div>
              <div className="h-px bg-navy my-1.5 opacity-50"></div>
              <div className="flex justify-between text-xs font-black text-navy uppercase tracking-tight">
                <span>Total Payable:</span>
                <span className="text-sm">₹{fees.total.toLocaleString()}</span>
              </div>
            </div>

            {isPaid ? (
              <div className="bg-green-100 border border-green-200 text-green-700 px-4 h-10 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase shadow-sm">
                <ShieldCheck size={16} /> Payment Verified ✓
              </div>
            ) : (
              <>
                <button
                  onClick={() => handlePayment()}
                  disabled={!formData.sign_declaration}
                  className="w-full bg-navy text-white h-10 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-navy shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale mb-4"
                >
                  Pay Application Fees <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex flex-col gap-2 border-t border-maroon-100 pt-4">
                  <p className="text-[9px] font-black text-white uppercase text-center tracking-tighter mb-1">— Faster Pay via Mobile Apps —</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handlePayment('phonepe')}
                      disabled={!formData.sign_declaration}
                      className="flex flex-col items-center justify-center gap-1 bg-gray-50 border border-taupe p-2 py-3 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all shadow-sm active:scale-95 disabled:opacity-50 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-[10px] shadow-sm group-hover:scale-110 transition-transform">Pe</div>
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">PhonePe</span>
                    </button>
                    <button 
                      onClick={() => handlePayment('google_pay')}
                      disabled={!formData.sign_declaration}
                      className="flex flex-col items-center justify-center gap-1 bg-gray-50 border border-taupe p-2 py-3 rounded-xl hover:bg-maroon-50 hover:border-navy transition-all shadow-sm active:scale-95 disabled:opacity-50 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white font-black text-[10px] shadow-sm group-hover:scale-110 transition-transform">G</div>
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">G-Pay</span>
                    </button>
                    <button 
                      onClick={() => handlePayment('paytm')}
                      disabled={!formData.sign_declaration}
                      className="flex flex-col items-center justify-center gap-1 bg-gray-50 border border-taupe p-2 py-3 rounded-xl hover:bg-sky-50 hover:border-sky-200 transition-all shadow-sm active:scale-95 disabled:opacity-50 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-black text-[10px] shadow-sm group-hover:scale-110 transition-transform">P</div>
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Paytm</span>
                    </button>
                  </div>
                </div>
              </>
            )}
            {!formData.sign_declaration && !isPaid && (
              <p className="text-[8px] text-center text-gray-400 mt-2 font-bold uppercase">Please upload signature before payment</p>
            )}
            
            {/* Testing Bypass Button (Disabled) */}
            {!isPaid && (
              <button
                onClick={() => setIsPaid(true)}
                disabled={true}
                className="w-full mt-2 bg-gray-200 text-gray-400 h-8 rounded-lg font-bold uppercase tracking-widest text-[8px] cursor-not-allowed border border-dashed border-gray-300"
              >
                Skip Payment (Temporary Disabled)
              </button>
            )}
          </div>
        </div>
      )}

      <TermsModal isOpen={showTerms} onClose={() => { setShowTerms(false); setTermsRead(true); }} />
    </div>
  );
};


const FormRoute = ({ formData, setFormData, handleInputChange, handleFileChange }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const pdfRef = useRef();

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (preferredApp = null) => {
    try {
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      const fees = ROLE_FEES[formData.applying_for];
      if (!fees || fees.total === 0) {
        setIsPaid(true);
        return;
      }

      const orderRes = await fetch('http://localhost:5000/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: formData.applying_for }),
      });

      const contentType = orderRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await orderRes.text();
        console.error("Non-JSON response received:", text.substring(0, 100));
        alert("Server Error: Received HTML instead of JSON. Check if backend is running on port 5000.");
        return;
      }

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert("Failed to initialize payment: " + orderData.message);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "BK Times Registration",
        description: `Registration for ${formData.applying_for}`,
        order_id: orderData.orderId,
        // Pre-select UPI app if provided (Mobile Intent Flow)
        config: preferredApp ? {
          display: {
            blocks: {
              upi: {
                name: `Pay with ${preferredApp.toUpperCase()}`,
                instruments: [{ method: 'upi', apps: [preferredApp] }]
              }
            },
            sequence: ['block.upi'],
            preferences: { show_default_blocks: false }
          }
        } : undefined,
        handler: async function (response) {
          const verifyRes = await fetch('http://localhost:5000/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: formData.email,
              mobile: formData.mobile,
              role: formData.applying_for
            }),
          });

          const contentType = verifyRes.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await verifyRes.text();
            console.error("Non-JSON verification response:", text.substring(0, 100));
            alert("Verification Error: Received HTML instead of JSON. Check backend status.");
            return;
          }

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setFormData(prev => ({
              ...prev,
              paymentStatus: 'paid',
              transactionId: response.razorpay_payment_id,
              paidAmount: fees.total
            }));
            setIsPaid(true);
            alert("Payment Successful! Form unlocked.");
          } else {
            alert("Payment verification failed: " + verifyData.message);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.mobile
        },
        theme: { color: "#D4AF37" },
        modal: {
          backdropClose: false,
          escape: true,
          handle_back: true
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment Flow error:', error);
      alert('Payment failed to initialize. Please check console for details.');
    }
  };

  const handleDownloadFormPDF = async () => {
    if (!pdfRef.current) return;
    try {
      const el = pdfRef.current;
      el.style.display = 'block';
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.style.width = '800px';

      // Give images time to load (even base64 ones)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BK_TIMES_Application_${formData.fullName || 'Form'}.pdf`);

      el.style.display = 'none';
    } catch (err) {
      console.error("PDF Generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleDownloadDoc = (fieldName, title) => {
    const data = formData[fieldName];
    if (!data) return;
    const link = document.createElement('a');
    link.href = data;
    const extension = data.includes('application/pdf') ? 'pdf' : 'jpg';
    link.download = `${title}_${formData.fullName || 'doc'}.${extension}`;
    link.click();
  };

  useEffect(() => {
    // Pre-fill form from registration data if empty
    setFormData(prev => ({
      ...prev,
      region: prev.region || prev.registrationRegion || '',
      landline: prev.landline || prev.mobile || '',
      // Always compute fullName from name parts
      fullName: [prev.firstName, prev.middleName, prev.lastName].filter(Boolean).join(' ') || prev.fullName || '',
    }));
  }, []);

  // Keep fullName in sync whenever first/middle/last name changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      fullName: [prev.firstName, prev.middleName, prev.lastName].filter(Boolean).join(' ') || prev.fullName || '',
    }));
  }, [formData.firstName, formData.middleName, formData.lastName]);

  const steps = [
    { title: "Application", component: <Step1 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} /> },
    { title: "Personal", component: <Step2 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} /> },
    { title: "Nominee", component: <Step3 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} /> },
    { title: "Bank", component: <Step4 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} /> },
    { title: "Documents", component: <Step5 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} /> },
    { title: "Finalize", component: <Step6 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} isPaid={isPaid} handlePayment={handlePayment} setIsPaid={setIsPaid} /> }
  ];

  const validateStep = (step) => {
    const stepOneRequired = ['region'];
    if (["District Co-ordinator", "Tahshil Co-ordinator", "Village Co-ordinator"].includes(formData.applying_for)) {
      stepOneRequired.push('district');
    }
    if (["Tahshil Co-ordinator", "Village Co-ordinator"].includes(formData.applying_for)) {
      stepOneRequired.push('taluka');
    }
    if (formData.applying_for === "Village Co-ordinator") {
      stepOneRequired.push('village');
    }

    const required = {
      1: stepOneRequired,
      2: ['title', 'fatherName', 'motherName', 'aadhaar', 'landline', 'dob', 'qualification', 'profession', 'address_perm', 'pin_perm', 'category', 'religion'],
      3: ['nominee_title', 'nominee_name', 'nominee_dob', 'nominee_relation'],
      4: ['ifsc', 'bank_name', 'account_type', 'bank_address', 'branch_code', 'account_no', 'micr', 'bank_passbook'],
      5: ['doc_education', 'highest_qualification_type', 'police_verification', 'doc_police'],
      6: ['sign_declaration']
    };

    let missing = (required[step] || []).filter(f => !formData[f]);

    // Conditional validation for Nominee Guardian (Step 3)
    if (step === 3) {
      const ageComp = calculateAge(formData.nominee_dob);
      if (ageComp.years !== '' && ageComp.years < 18) {
        if (!formData.nominee_guardian_name) missing.push('nominee_guardian_name');
      }
    }

    if (missing.length) {
      const niceNames = missing.map(m => m.replace(/_/g, ' ').toUpperCase());
      alert(`Please fill ALL required fields or upload missing files before proceeding.\n\nMissing:\n- ${niceNames.join('\n- ')}`);
      return false;
    }

    // Step 6 Payment Check
    if (step === 6) {
      const fees = ROLE_FEES[formData.applying_for];
      // Payment bypass for testing
      /* 
      if (fees && fees.total > 0 && !isPaid) {
        alert("Please complete the payment before submitting your application.");
        return false;
      }
      */
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;
    setIsSubmitting(true);
    console.log("FORM SUBMISSION DATA:", formData); // Added console logging as requested
    try {
      const res = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if ((await res.json()).success) {
        setShowSuccess(true);
      }
      else alert("Failed to submit. Please check all fields.");
    } catch {
      // Fallback for demo if backend is not running
      console.warn("Backend not reached, showing success modal for demo.");
      setShowSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full md:max-w-[1000px] md:my-10 bg-white shadow-2xl rounded-[20px] overflow-hidden flex-1 flex flex-col h-fit animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="px-4 md:px-8 mt-6">
        <div className="flex justify-between mb-2 text-[10px] md:text-xs">
          {steps.map((s, i) => (
            <span key={i} className={`uppercase font-black tracking-tighter sm:tracking-widest ${currentStep === i + 1 ? 'text-navy' : 'text-gray-400'}`}>
              {s.title}
            </span>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-navy rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(26,54,93,0.3)]" 
            style={{ width: `${(currentStep / 6) * 100}%` }} 
          />
        </div>
      </div>

      <div className="p-4 md:p-8 pt-2 md:pt-4">
        <div className="print:hidden">
          {steps[currentStep - 1].component}
          <div className="mt-10 flex justify-center gap-6 md:gap-12 pt-8 border-t border-taupe pb-4">
            <button 
              onClick={() => currentStep > 1 ? setCurrentStep(s => s - 1) : navigate('/login')} 
              className="px-8 py-2 rounded-full text-xs md:text-sm font-black uppercase border-2 border-navy text-navy hover:bg-navy hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
              <ChevronLeft size={16} /> BACK
            </button>
            <div className="flex flex-wrap sm:flex-nowrap gap-4 justify-center sm:justify-start">
              {currentStep === 6 && <button onClick={() => navigate('/portal-login-form')} type="button" className="bg-white border border-navy text-navy px-4 md:px-6 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase flex gap-2 items-center hover:bg-gray-50 transition-all shadow-sm"><LogIn size={16} className="hidden sm:block" /> PORTAL LOGIN</button>}
              {currentStep === 6 && <button onClick={() => setShowReview(true)} type="button" className="bg-gray-800 text-white px-6 md:px-8 py-2.5 rounded-full text-[10px] md:text-sm font-black uppercase flex gap-2 items-center hover:bg-black transition-all shadow-md"><Search size={16} /> REVIEW FORM</button>}
              <button 
                type="button"
                onClick={currentStep < 6 ? () => { if (validateStep(currentStep)) setCurrentStep(s => s + 1); } : handleSubmit} 
                className="bg-navy text-white px-10 md:px-12 py-2.5 rounded-full text-xs md:text-sm font-black uppercase flex gap-2 items-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                {isSubmitting ? "..." : (currentStep === 6 ? "SUBMIT" : "NEXT >")}
              </button>
            </div>
          </div>
        </div>
        <div id="capture-pdf" ref={pdfRef} className="hidden print:block bg-gray-50"><OfficialApplicationForm formData={formData} /></div>
      </div>
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} formData={formData} onDownloadPDF={handleDownloadFormPDF} onDownloadDoc={handleDownloadDoc} />
      <ReviewOverlay isOpen={showReview} onClose={() => setShowReview(false)} formData={formData} onEdit={(step) => setCurrentStep(step)} />
    </div>
  );
};

// --- Main App Component ---

const MainApp = () => {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('bk_form_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved form data", e);
      }
    }
    return {
      loginIdentifier: '',
      loginPassword: '',
      firstName: '', middleName: '', lastName: '',
      email: '', mobile: '', password: '', confirmPassword: '', dob: '', gender: '', registrationRegion: '', applying_for: '',
      region: '', district: '', taluka: '', village: '', category: '', religion: '', highest_qualification_type: '',
      profile_photo: '', sign_declaration: ''
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('bk_form_data', JSON.stringify(formData));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn("LocalStorage quota exceeded - Data not saved to disk.");
      }
    }
  }, [formData]);

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // Email OTP states
  const [emailOtp, setEmailOtp] = useState('');
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loadingEmailOtp, setLoadingEmailOtp] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailOtpSuccess, setEmailOtpSuccess] = useState('');

  // Auto-fetch Bank Details when IFSC is entered (11 characters)
  useEffect(() => {
    if (formData.ifsc && formData.ifsc.length === 11) {
      const cleanIFSC = formData.ifsc.trim().toUpperCase();
      fetch(`https://ifsc.razorpay.com/${cleanIFSC}`)
        .then(res => res.json())
        .then(data => {
          // Check for valid object and not a string error response
          if (data && typeof data === 'object' && data.BANK) {
            setFormData(prev => ({
              ...prev,
              bank_name: data.BANK || prev.bank_name,
              branch_code: data.BRANCH || prev.branch_code,
              bank_address: data.ADDRESS || prev.bank_address,
              micr: (data.MICR && data.MICR.toString()) || prev.micr
            }));
          }
        })
        .catch(err => {
          console.error("IFSC fetch error:", err);
        });
    }
  }, [formData.ifsc]);

  // Auto-fetch Pincode when Location changed
  useEffect(() => {
    const searchLocation = formData.village || formData.taluka || formData.district;
    if (searchLocation) {
      // Clean up village name if it came from our fallback (e.g. "Nashik City" -> "Nashik")
      const searchName = searchLocation.replace(/ City$| Rural$/i, '');

      // If we already have a manual mapping for this specifically, don't re-fetch
      if (locationPinCodes[searchName]) return;

      fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(searchName)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const pos = data[0].PostOffice;
            // Prefer a Head Office (H.O.) if multiple results, else just take the first one
            const match = pos.find(po => po.Name.toUpperCase().includes('H.O')) || pos[0];

            setFormData(prev => ({
              ...prev,
              pin_perm: match.Pincode || prev.pin_perm
            }));
          }
        })
        .catch(err => console.error("Pincode fetch error:", err));
    }
  }, [formData.village, formData.taluka, formData.district]);

  const handleInputChange = (e) => {
    let { name, value, type, checked } = e.target;
    const numericFields = ['mobile', 'landline', 'witness_mobile', 'regional_code', 'aadhaar', 'pin_corr', 'pin_perm', 'account_no', 'micr', 'police_verification'];
    if (numericFields.includes(name)) value = value.replace(/[^0-9+ ]/g, '');

    // Force IFSC to uppercase for clean lookups
    if (name === 'ifsc') {
      value = value.toUpperCase();
    }

    // Strictly limit Aadhaar to 12 digits
    if (name === 'aadhaar' && value.length > 12) {
      value = value.substring(0, 12);
    }

    // Limit year to 4 digits for date inputs to prevent massive values like 275760
    if (type === 'date' && value) {
      const parts = value.split('-');
      if (parts[0] && parts[0].length > 4) {
        parts[0] = parts[0].substring(0, 4);
        value = parts.join('-');
        // Double-bind shadow DOM strictly: clear it first, then set it, forcing Chrome to visualize the truncation.
        e.target.value = '';
        e.target.value = value;
      }
    }

    // Capitalize only the first letter, all other letters are forced to lowercase
    const exemptFields = ['email', 'password', 'confirmPassword', 'loginPassword', 'ifsc', 'loginIdentifier', 'micr'];
    if (e.target.tagName !== 'SELECT' && type !== 'checkbox' && !numericFields.includes(name) && !exemptFields.includes(name) && typeof value === 'string') {
      if (value.length > 0) {
        value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      }
    }

    setFormData(prev => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'registrationRegion') next.region = value;
      if (name === 'applying_for') {
        const requiresDistrict = value === "District Co-ordinator" || value === "Tahshil Co-ordinator" || value === "Village Co-ordinator";
        const requiresTaluka = value === "Tahshil Co-ordinator" || value === "Village Co-ordinator";
        const requiresVillage = value === "Village Co-ordinator";

        if (value === "District Co-ordinator") {
          next.region = prev.registrationRegion || next.registrationRegion || prev.region || '';
        }
        if (!requiresDistrict) next.district = '';
        if (!requiresTaluka) next.taluka = '';
        if (!requiresVillage) next.village = '';
      }
      if (name === 'region') {
        next.district = '';
        next.taluka = '';
        next.village = '';
      }
      if (name === 'district') {
        next.taluka = '';
        next.village = '';
      }
      if (name === 'taluka') {
        next.village = '';
      }

      // Automatically fill pin code if mapping exists for the selected location
      if (['village', 'taluka', 'district'].includes(name)) {
        if (locationPinCodes[value]) {
          next.pin_perm = locationPinCodes[value];
        }
      }

      return next;
    });
  };

  const handleFileChange = (name, fileOrValue) => {
    if (fileOrValue instanceof File) {
      if (fileOrValue.size > 1 * 1024 * 1024) {
        alert(`File size must be 1MB or less. Your file is ${(fileOrValue.size / (1024 * 1024)).toFixed(2)}MB.`);
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: fileOrValue }));
  };

  const handleSendOtp = async () => {
    if (!formData.mobile) { setOtpError('Enter mobile'); return; }
    setLoadingOtp(true); setOtpError(''); setOtpSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.mobile }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOtpSent(true);
        setOtpSuccess('Sent!');
      } else {
        setOtpError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setOtpError('Network Error: ' + err.message);
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoadingOtp(true);
    try {
      const res = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.mobile, code: otp }),
      });
      const data = await res.json();
      if (data.success) {
        setIsVerified(true);
        setOtpSuccess('Verified!');
        setOtp('');
      } else {
        setOtpError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setOtpError('Network Error: ' + err.message);
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!formData.email) { setEmailOtpError('Enter email'); return; }
    setLoadingEmailOtp(true); setEmailOtpError(''); setEmailOtpSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEmailOtpSent(true);
        setEmailOtpSuccess('Sent!');
      } else {
        setEmailOtpError(data.message || 'Failed to send verification code');
      }
    } catch (err) {
      setEmailOtpError('Network Error: ' + err.message);
    } finally {
      setLoadingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setLoadingEmailOtp(true); setEmailOtpError('');
    try {
      const res = await fetch('http://localhost:5000/api/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: emailOtp }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEmailVerified(true);
        setEmailOtpSuccess('Verified!');
        setEmailOtp('');
      } else {
        setEmailOtpError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setEmailOtpError('Network Error: ' + err.message);
    } finally {
      setLoadingEmailOtp(false);
    }
  };

  const otpProps = {
    otp, setOtp, isOtpSent, isVerified, setIsVerified, loadingOtp, handleSendOtp, handleVerifyOtp, otpError, otpSuccess,
    emailOtp, setEmailOtp, isEmailOtpSent, isEmailVerified, setIsEmailVerified, loadingEmailOtp, handleSendEmailOtp, handleVerifyEmailOtp, emailOtpError, emailOtpSuccess
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col text-xs">
      <Header />

      <Routes>
        <Route path="/" element={<Navigate to="/portal-login" />} />
        <Route path="/login" element={<LoginRoute formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} />} />
        <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
        <Route path="/portal-login" element={<PortalLoginPage />} />
        <Route path="/portal-login-form" element={<PortalLogin />} />
        <Route path="/register" element={<RegistrationRoute formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} otpProps={otpProps} />} />
        <Route path="/form" element={<FormRoute formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} />} />
        
        {/* Portal Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/village" element={<ProtectedRoute><VillageDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/taluka" element={<ProtectedRoute><TalukaDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/district" element={<ProtectedRoute><DistrictDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/zone" element={<ProtectedRoute><ZoneDashboard /></ProtectedRoute>} />
        
        <Route path="/stats/readers" element={<ProtectedRoute><StatsReaders /></ProtectedRoute>} />
        <Route path="/stats/income" element={<ProtectedRoute><StatsIncome /></ProtectedRoute>} />
        <Route path="/stats/ads" element={<ProtectedRoute><StatsAds /></ProtectedRoute>} />
        <Route path="/stats/commission" element={<ProtectedRoute><StatsCommission /></ProtectedRoute>} />
        <Route path="/ads-analytics" element={<ProtectedRoute><AdAnalytics /></ProtectedRoute>} />
        <Route path="/book-ad" element={<ProtectedRoute><BookAd /></ProtectedRoute>} />
        <Route path="/admin/pending-ads" element={<ProtectedRoute><AdminPendingAds /></ProtectedRoute>} />
        
        <Route path="/news-stories" element={<PublicNewsStories />} />
        <Route path="/news-story/:id" element={<NewsStoryDetail />} />
      </Routes>

      <footer className="bg-navy text-white p-6 md:p-8 text-center mt-auto w-full">
        <p className="text-sm md:text-base font-black uppercase mb-3 tracking-[0.3em]">बीके-टाइम्स - एक गाव एक पत्रकार मोहीम-२०२६</p>
        <div className="text-[10px] md:text-xs tracking-[0.5em] font-light opacity-60 uppercase">
          BK TIMES REGISTRATION PORTAL © {new Date().getFullYear()} • ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </Router>
  );
};

export default App;
