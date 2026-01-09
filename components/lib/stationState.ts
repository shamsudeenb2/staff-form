// lib/nigeria.ts

export interface NigeriaState {
  name: string
  station: string[]
}

export const nigeriaStates: NigeriaState[] = [
  {
    name: "FCT Abuja",
    station: [
      "GPO (HEAD OFFICE)", "MINI POST OFFICE", "NATIONAL ASSEMBLY", 
      "ADCPA AREA 1 POST OFFICE", "SECRETARIAT POST OFFICE", "NYANYA POST OFFICE", 
      "KARU POST OFFICE", "WUSE P.O (HEAD OFFICE)", "KUBWA POST OFFICE", 
      "PUBLIC SERVICE INSTITUTE P.O", "DEI DEI POST OFFICE", "BWARI POST OFFICE", 
      "GWAGWALADA P.O (HEAD OFFICE)", "KUJE POST OFFICE", "ABAJI POST OFFICE", 
      "KWALI POST OFFICE"
    ]
  },
  {
    name: "Lagos Island",
    station: [
      "MARINA G.P.O", "LAFIAJI", "ADENIJI-ADELE", "IDUMAGBO", "MOLONEY", 
      "BADORE", "VICTORIA ISLAND", "IKOTA", "IKOYI", "LEKKI", "MAGBON-ALADE"
    ]
  },
  {
    name: "Lagos Mainland",
    station: [
      "GPO IKEJA", "MURITALA MUHAMMED INT'L AIRPORT", "ALAUSA P.O.", 
      "AIRFORCE BASE P.O.", "JULI P.O", "SHOMOLU (HEAD OFFICE)", "YABA P.O", 
      "KETU P.O.", "UNILAG P.O.", "APELEYIN P.O.", "SURULERE P.O.", 
      "EBUTE METTA P.O.", "IJESHA P.O.", "MUSHIN P.O.", "OSHODI P.O.", 
      "ISOLO P.O.", "OTSPO P.O.", "JAKANDE P.O.", "EJIGBO P.O.", "ISAWO P.O.", 
      "AGBOWA P.O.", "IMOTA P.O.", "LASUTECH P.O.", "IJEDE P.O.", "IGBOGBO P.O.", 
      "AGEGE DISTRICT (HEAD OFFICE)", "AGUDU P.O.", "AJUWON P.O.", "ALAKUKO P.O.", 
      "FESTAC P.O.", "LASU P.O.", "ASPMDA P.O.", "IPAJA P.O.", "IKOTUN P.O.", 
      "OKE-ODO P.O.", "OTA P.O.", "AGBADO P.O.", "IFO P.O.", "IGBESA P.O.", 
      "ADO P.O.", "IMUDE", "NAVY TOWN", "MOBIL ROAD", "AJEGUNLE", "AMUKOKO", 
      "EREDO", "AGBARA", "IJANINKIN", "BADAGRY", "AJARA", "SATELLITE TOWN"
    ]
  },
  {
    name: "Borno",
    station: [
      "GPO Maiduguri", "Gwange P.O.", "Baga Raod P.O.", "Unimaid P.O.", 
      "Fed Sec P.O.", "Jos Road P.O.", "Bosu P.O.", "Biu Head Office.", 
      "Army Barracks P.O.", "Marama P.O.", "Shani P.O."
    ]
  },
  {
    name: "Ebonyi",
    station: [
      "GPO Abakiliki", "Abakaliki H.O.", "Onueke P.O.", "Afikpo H.O.", 
      "Ishiagu P.O.", "Uwana P.O.", "Fed Poly Uwana", "Okposi P.O.", "CBU EBONYI"
    ]
  },
  {
    name: "Bauchi",
    station: [
      "BAUCHI G.P.O", "GIDAN MAI P.O", "ATBU P.O", "ALKALERI", "TORO P.O", 
      "DASS P.O", "TAFAWA-BALEWA P.O", "NINGI P.O", "FED. SEC. P.O", 
      "AZARE (Head Office)", "MISAU P.O", "DARAZO P.O", "YANA. PO", 
      "ITAS P.O", "GAMAWA P.O", "JAMA’ARE P.O", "KARI P.O", "AKUYAM P.O"
    ]
  },
  {
    name: "Edo",
    station: [
      "GPO BENIN", "AKPAKPAVA P.O", "UGBOWO P.O", "OGIDA P.O", "OKADA P.O", 
      "FED.SECT. P.O", "ABUDU P.O", "IGBANKE P.O", "OLOGBO P.O", "EHOR P.O", 
      "SOBE P.O", "AUCHI (Head Office)", "IGARRA P.O", "S/ORA P.O", "A/BODE P.O", 
      "UZAIRUE P.O", "AGBEDE P.O", "IYAKPI P.O", "FUGAR P.O", "EKPOMA H.O", 
      "UROMI P.O", "UBIAJA", "AAU", "EBELLE", "IGUEBEN", "IRUEKPEN", "EWU", "EWOHIMI"
    ]
  },
  {
    name: "Osun",
    station: [
      "OSOGBO", "EDE P.O", "EDE B.O.", "IFON OSUN", "IWO", "OLLA", "EJIGBO", 
      "IRAGBIJI", "IRESI", "IGBAJO", "ADA", "IKIRUN", "IBA", "OKUKU", "OYAN", 
      "IGBAYE", "IREE", "ILA-ORANGUN", "ERIN-OSUN", "OTAN AYEGBAJU", "ILE-IFE", 
      "IFETEDO", "GBONGAN", "MODAKEKE", "ODE-OMU", "IKIRE", "IFE- B.O.", "OAU", 
      "OAU EXTENSION", "EDUN ABON", "IPETUMODU", "MORO", "ILESA", "TEMIDIRE IMADIN", 
      "IJEBU JESA", "ESA OKE", "ILOKO IJESA", "IPETU JESA", "IBOKUN", "IKEJI-ILE", 
      "ILARE", "IWARA", "OSU", "ERINMO", "IFEWARA"
    ]
  },
  {
    name: "Zamfara",
    station: ["GUSAU G.P.O", "KAURA NAMODA P.O", "TALATA MARAFA P.O"]
  },
  {
    name: "Gombe",
    station: [
      "GOMBE G.P.O", "KASUWA P.O. TUDUN WADA", "KUMO P.O. AKKO LGA", 
      "BILLIRI P.O.", "KALTOUNGO", "DEBA P.O.", "FED. SEC. COMPLEX GOMBE", 
      "KASHERE COUNTER EXTENSION", "BADOGA P.O."
    ]
  },
  {
    name: "Taraba",
    station: [
      "STATE POSTAL MANAGER", "CBU TARABA", "JALINGO P.O.", "WUKARI P.O.", 
      "ZING P.O.", "P/SAWA P.O.", "KARIM LAMIDO P.O.", "SERTI P.O.", 
      "GEMBU P.O.", "TAKUM P.O.", "DONGA P.O.", "BAISSA P.O.", "BALI P.O.", "LAU P.O"
    ]
  },
  {
    name: "Ondo",
    station: [
      "AKURE (G.P.O)", "IGBARA OKE", "IJU", "ITAOGBOLU", "ILARA", "FUTA", 
      "IJARE", "OYEMEKUN", "FEDERAL SECRETARIAT", "ONDO (Head Office)", 
      "ILE OLUJI", "ORE", "OKEIGBO", "OKITIPUPA", "ONIPARAGA", "ADEYEMI UNI. OF EDU. ONDO", 
      "OWO", "IPE AKOKO", "KARE AKOKO", "OKA AKOKO A", "ARIGIDI AKOKO", "IRUN AKOKO", 
      "OKE AGBE AKOKO", "OGBAGI AKOKO", "9 AKUNGBA AKOKO", "OBA AKOKO", 
      "IWARO- OKA AKOKO", "IFON", "AJOWA AKOKO", "EPINMI AKOKO", "IDOANI"
    ]
  },
  {
    name: "Yobe",
    station: ["STATE POSTAL MANAGER", "DAMATURU P.O.", "GEIDAM P.O.", "POTISKUM P.O.", "NGURU P.O.", "GASHUA P.O."]
  },
  {
    name: "Cross River",
    station: [
      "CALABAR G.P.O", "CAL SOUTH", "CAL, MUNICIPAL", "ODUKPANI", "IKOM", 
      "UGEP YAKURR", "OBUBRA L.G", "ABI L.G", "BIASE", "OGOJA L.G", "OBUDU L.G", "BOKI L.G"
    ]
  },
  {
    name: "Kebbi",
    station: [
      "BIRNIN KEBBI G.P.O", "ARGUNGU P.O.", "BUNZA P.O.", "GESSE P.O.", 
      "GWANDU P.O.", "ALEIRO P.O.", "JEGA P.O.", "KANGIWA P.O.", "KAMBA P.O.", 
      "ZURU (HEAD OFFICE)", "KOKO P.O.", "DIRIN-DAJI P.O.", "MAHUTA P.O.", 
      "RIBAH P.O.", "BAGUDO P.O.", "YELWA YAURI P.O."
    ]
  },
  {
    name: "Kogi",
    station: [
      "LOKOJA P.O.", "OKENE P.O.", "AJAOKUTA P.O.", "IHIMA P.O.", "OGORI P.O.", 
      "IFAKPE P.O.", "G.P.O KABBA (Head Office)", "AYETORO-GBEDE P.O", "MOPA P.O", 
      "AMURO P.O", "ISANLU P.O", "EGBE P.O", "IYARA P.O", "IYAMOYE P.O", 
      "EKINRINADE P.O", "IFE-IJUMU P.O", "EGBEDA P.O", "EJIGBA P.O", "OKO-ERE P.O.", 
      "ANYIGBA (Head Office)", "IDAH P.O.", "ANKPA P.O.", "ABEJUKOLO P.O.", 
      "DEKINA P.O.", "OKPO P.O.", "EJULE P.O.", "AGUME P.O.", "OGUMA P.O.", "ONYEDEGA P.O."
    ]
  },
  {
    name: "Kwara",
    station: [
      "GENERAL POST OFFICE ILORIN", "ASUNNARA P.O", "BABOKO P.O", "OLOJE/AJIKOBI P.O", 
      "UNILORIN", "JEBBA P.O.", "BACITA", "OKUTA P.O", "KAIMA P.O", "SHARE P.O", 
      "PATEGI P.O", "LAFIAGI P.O", "AFON P.O", "FEDERAL SECRETARIAT P.O.", 
      "OMU-ARAN P.O", "ORO P.O", "ERUKU P.O", "EDIDI P.O", "ESIE P.O", "IWO-ISIN P.O", 
      "IJARA ISIN", "OKE-ONIGBIN P.O", "OWU-ISIN P.O", "ILOFFA P.O", "OSI P.O", 
      "OFFA P.O", "AJASE-IPO P.O", "IJAGBO P.O", "IPEE P.O", "ERIN-ILE P.O", "IGBAJA P.O"
    ]
  },
  {
    name: "Niger",
    station: [
      "G.P.O MINNA", "STATION ROAD", "FUT POST OFFICE", "FED. SECRETARIAL POST OFFICE", 
      "KUTA POST OFFICE", "ZUGERU POST OFFICE", "WUSHISHI POST OFFICE", "PAIKO POST OFFICE", 
      "BIDA HEAD OFFICE", "DOKO POST OFFICE", "LAPAI POST OFFICE", "KATCHA POST OFFICE", 
      "BADEGGI POST OFFICE", "KUTIGI POST OFFICE", "BARO POST OFFICE", "KONTAGORA POST OFFICE", 
      "NEW BUSSA POST OFFICE", "MOKWA POST OFFICE", "KAGARA POST OFFICE", "RIJAU POST OFFICE", 
      "SULEJA POST OFFICE", "SULEJA PLAZA POST OFFICE"
    ]
  },
  {
    name: "Nasarawa",
    station: [
      "LAFIA G.P.O", "DOMA P.O.", "AGYARAGU P.O.", "KEANA P.O.", "OBI P.O.", 
      "MARARABA P.O.", "NEW KARU P.O", "NASARAWA EGGON P.O.", "GUDI P.O.", 
      "AKANGA P.O.", "WAMBA P.O.", "AWE P.O.", "TOTO P.O."
    ]
  },
  {
    name: "Sokoto",
    station: [
      "G.P.O SOKOTO", "MARINA P.O. SOKOTO", "TAMBUWAL P.O.", "ISA P.O.", 
      "YABO P.O.", "BODINGA P.O.", "WURNO P.O.", "GWADABAWA P.O.", "GIDAN-MADI P.O.", 
      "ILLELA P.O.", "GUMMI P.O.", "FED. SECT. P.O."
    ]
  },
  {
    name: "Adamawa",
    station: [
      "G.P.O. JIMETA", "YOLA TOWN", "MUBI", "NUMAN", "MAYO/ BELWA", "GANYE", 
      "DEMSA", "SONG", "SHELLENG", "FUFORE", "L/ LAMURDE", "JADA", "GOMBI", 
      "HONG", "MICHIKA", "GARKIDA", "BORRONG (MARK. MANAGER)"
    ]
  },
  {
    name: "Enugu",
    station: [
      "ENUGU G.P.O", "EMENE P.O.", "AIR PORT P.O.", "UMUABI P.O.", 
      "AGU OBU - UMUMBA P.O.", "UDI P.O.", "EHA - AMUFU P.O.", "AFFA P.O.", 
      "HOUSE OF ASSEMBLY P.O.", "OGBETE P.O.", "UNEC P.O.", "NSUKKA (Head Office)", 
      "UNN P.O.", "OBOLLO - AFOR P.O.", "ENUGU EZIKE P.O.", "OGBEDE P.O.", 
      "AKU P.O.", "ADANI P.O.", "AWGU HEAD OFFICE", "OJI RIVER P.O.", "INYI P.O.", 
      "AGBOGUGU P.O."
    ]
  },
  {
    name: "Plateau",
    station: [
      "GPO JOS", "ANGLO JOS", "FED. SECT.", "BUKURU", "UNI-JOS", "BARKIN LADI", 
      "ZARIA ROAD", "JOS NORTH", "NIPSS KURU", "PLASU BOKKOS", "VOM", "RUKUBA", 
      "PANKSHIN", "MANGU", "GINDIRI", "KABWIR", "SHENDAM", "LANGTANG", 
      "YELWA ISHAR", "GARKAWA", "WASE", "BA'AP", "DENGI", "AMPER"
    ]
  },
  {
    name: "Oyo",
    station: [
      "GPO DUGBE", "SECRETARIAT", "MAPO", "U.I IBADAN", "AGODI GATE", 
      "AGUGU OREMEJI", "ELEYELE", "LALUPON", "ERUNMU", "IGBOORA", "ERUWA", 
      "LANLATE", "TAPA", "MOLETE", "FED. SEC", "GPO OYO", "SAKI", "SEPETERI", 
      "TEDE", "AGO-ARE", "IGBOJAYE", "ISEYIN", "OKEHO", "AGO AMODU", "AWE", 
      "BACOTHO", "FIDITI", "ILORA", "IGANNA", "GPO OGBOMOSO", "IGBETI", "KISHI", 
      "IJERU", "AJA-AWA", "IKOYI-ILE", "IGBOHO", "LAUTECH"
    ]
  },
  {
    name: "Anambra",
    station: [
      "AWKA GPO", "AMAWBIA", "ENUGWU-UKWU", "IFITEDUNU", "AWKUZU", "AGULU", 
      "AGUATA", "NRI P.O.", "OKO P.O.", "NIBO P.O.", "NIMO P.O.", "AJALLI P.O.", 
      "UMUNZE P.O.", "IGBO-UKWU P.O.", "ISUOFIA P.O.", "NANKA P.O.", 
      "BIDA POST OFFICE, ONITSHA", "ONITSHA HEAD OFFICE", "OBA P.O.", "OGIDI P.O.", 
      "FEGGE P.O.", "OBOSI P.O.", "AFORIGWE P.O.", "UMUOJI P.O.", "ABATETE P.O.", 
      "OGBUNIKE P.O.", "NKWELLE-EZINAKA P.O.", "NKPOR EXPRESS P.O.", "OJOTO P.O.", 
      "UNUBI P.O.", "NNOBI P.O.", "NNEWI HEAD OFFICE", "IHIALA HEAD OFFICE", 
      "OZUBULU P.O.", "ORAIFITE P.O.", "UKPOR P.O."
    ]
  },
  {
    name: "Jigawa",
    station: [
      "GPO DUTSE", "FED. SEC", "KIYAWA", "B/KUDU", "HADEJIA", "BABURA", 
      "RINGIM", "GUMEL", "M/MADORI", "GARKI", "GAGARAWA"
    ]
  },
  {
    name: "Ekiti",
    station: [
      "ADO OFFICE", "IGBARA-ODO P.O", "IDO OFFICE", "ORIN OFFICE", "ILAWE OFFICE", 
      "AWO OFFICE", "ISE OFFICE", "OKEMESI OFFICE", "IKERE OFFICE", "AROMOKO OFFICE", 
      "EFON OFFICE", "IFAKI OFFICE", "OSI OFFICE", "IYIN OFFICE", "IGEDE OFFICE", 
      "IJAN OFFICE", "ERINJIYAN OFFICE", "EMURE OFFICE", "IYE OFFICE", "IKOLE OFFICE", 
      "OYE OFFICE", "USI OFFICE", "IUPEJU OFFICE", "AYETORO P.O.", "ISAN P.O.", 
      "IJERO P.O.", "OTUN P.O.", "ILORO P.O.", "ILOGBO P.O.", "IKORO P.O.", 
      "OMUO P.O.", "ODE P.O.", "AISEGBA P.O.", "ISABA P.O.", "AYEDE P.O.", "IRE P.O.", 
      "IJESA ISU P.O."
    ]
  },
  {
    name: "Delta",
    station: [
      "ASABA H.O", "IBUSA( PO)", "OGWUASHI-UKWU ( PO)", "UBULUKU (PO)", 
      "OBIOR (PO)", "AKUKWU-IGBO", "OKPANAM (PO)", "NSUKWA (PO)", "ILLAH (PO)", 
      "EWULU", "UBULU-UNOR", "WARRI HO", "SAPELE (PO)", "EFFURUN (PO)", 
      "ABRAKA (PO)", "DSC (PO)", "AGBARHO (PO)", "EKU (PO)", "OREROKPE (PO)", 
      "UGHELLI HO", "KWALE (PO)", "OZORO (PO)", "OLEH (PO)", "OBIARUKU (PO)", 
      "IGBIDE (PO)", "EKAKPRAME (PO)", "UMUTU (PO)", "AMAI (PO)", "AGBOR HO", 
      "ISSELE-UKU (PO)", "ONICHA-UGBO (PO)", "EZI (PO)", "IDUMEJE UGBOKO (PO)", 
      "ISSELE MKPITIME (PO)", "IGBODO (PO)", "UMUNEDE (PO)", "OWANTA (PO)", 
      "NDEMILI (PO)", "OWA-ALERO (PO)", "OWA-OYIBU (PO)", "EBU (PO)"
    ]
  },
  {
    name: "Benue",
    station: [
      "MAKURDI GPO", "DAUDU P.O", "ALIADE P.O", "FED. UNI. OF AGRIC. MAKURDI", 
      "BENUE STATE UNI. MAKURDI P.O", "HIGH LEVEL POST OFFICE MAKURDI", 
      "FED. SECRETARIAT MAKURDI P.O", "OTUKPO H.O", "LGA OKPAYA", "IGUMALE", 
      "GBOKO G.P.O", "PALACE P.O", "UNIMKAR P.O", "VANDEIKYA P.O", "LESSEL P.O", 
      "KATSINA-ALA P.O", "ADIKPO P.O", "ADI-ETULO P.O"
    ]
  },
  {
    name: "Bayelsa",
    station: [
      "G.P.O Yenagoa (Head Office)", "FED. SECRETARIAT P.O", "OMOKU P.O", 
      "ABUA P.O", "BRASS P.O", "AHOADA P.O", "OGBIA P.O", "MBIAMA P.O", "NDONI P.O"
    ]
  },
  {
    name: "Ogun",
    station: [
      "SAPON GPO", "IBARA P.O", "TOTORO P.O", "FUNAAB P.O", "FED. COLLEGE of EDU. P.O", 
      "ODEDA P.O", "FED. SEC. P.O", "ILARO P.O", "FED. POLY P.O", "OWODE YEWA P.O", 
      "OKE ODAN P.O", "AIYETORO P.O", "OWODE EGBA P.O", "OBAFEMI P.O", "IMEKO P.O", 
      "IJEBU ODE P.O", "IJEBU IGBO P.O", "IJEBU MUSHIN P.O", "IJEBU IFE P.O", 
      "AGO IWOYE P.O", "ODOGBOLU P.O", "SAGAMU P.O", "RCCG P.O", "IPERU P.O", 
      "ODE REMO P.O", "ISHARA P.O", "MTU2 P.O", "BABCOCK P.O", "IKENNE P.O"
    ]
  },
  {
    name: "Rivers",
    station: [
      "GPO PORT HARCOURT", "DIOBU P.O", "AGGREY ROAD P.O", "CEAPOLY P.O", 
      "UNIPORT P.O", "RIVERS STATE UNI.", "IGNATIUS UNIVERSITY", "ELELE P.O", 
      "OKEHI P.O", "BONNY P.O", "BUGUMA P.O", "ABONNEMA P.O", "TRANS-AMADI H.O", 
      "WOJI P.O", "FED/SECRETERIAT P.O", "NCHIA ELEME P.O", "BORI P.O", 
      "OKRIKA P.O", "BODO P.O"
    ]
  },
  {
    name: "Imo",
    station: [
      "G.P.O OWERRI", "ALADINMA", "F.U.T.O P.O", "FEDERAL SECRETARIAT P.O", 
      "UMUNOHA P.O", "IZOMBE P.O", "NEW OWERRI P.O", "OBUBE P.O", "ULAKWO P.O", 
      "ATTA P.O", "OKPALA P.O", "IHIAGWA P.O", "MBAITOLI P.O", "IHO P.O", 
      "MBIERI P.O", "NKWOGWU HEAD OFFICE", "ENYIOGUFU P.O", "OBIZI P.O", 
      "ONICHA", "EKWEREAZU", "IFE-EZI", "OKPOFE", "CHOKONEZE", "OGBE", 
      "ORLU HEAD OFFICE", "BIDI", "UMUAKA", "NEMPI/AJI", "OSINA", "UEUALLA", 
      "AWO OMAMMA", "OGUTA", "OKWUDOR", "NKWERE", "AMAIGBO", "AKOKWA", 
      "EHIME P.O", "AMARAKU", "UTURU"
    ]
  },
   {
    name: "Headquarters",
    station: ["Headquarters"]
  },
     {
    name: "EMS",
    station: ["EMS"]
  },
     {
    name: "IMPC",
    station: ["IMPC"]
  },
     {
    name: "NMDC",
    station: ["NMDC"]
  },
     {
    name: "BULK Post",
    station: ["BULK Post"]
  },
]

export const getstationByState = (stateName: string): string[] => {
  const state = nigeriaStates.find(s => s.name.toLowerCase() === stateName.toLowerCase())
  return state ? state.station : []
}
