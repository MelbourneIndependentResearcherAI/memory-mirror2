import React, { useState } from 'react';
import { ArrowLeft, Phone, Globe, Heart, Shield, BookOpen, Headphones, FileText, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import PageLoadTip from '@/components/tips/PageLoadTip';

const countryResources = {
  australia: {
    name: 'Australia',
    flag: '🇦🇺',
    emergency: {
      police: '000',
      ambulance: '000',
      fire: '000',
      crisis: '13 11 14 (Lifeline)',
      domesticViolence: '1800 737 732',
      suicide: '13 11 14'
    },
    dementia: [
      { name: 'Dementia Australia', phone: '1800 100 500', website: 'https://www.dementia.org.au', desc: '24/7 National Dementia Helpline' },
      { name: 'Aged Care Quality and Safety Commission', phone: '1800 951 822', website: 'https://www.agedcarequality.gov.au', desc: 'Aged care complaints and support' },
      { name: 'My Aged Care', phone: '1800 200 422', website: 'https://www.myagedcare.gov.au', desc: 'Government aged care gateway' },
      { name: 'Carer Gateway', phone: '1800 422 737', website: 'https://www.carergateway.gov.au', desc: 'Free services and support for carers' }
    ],
    caregiver: [
      { name: 'Carers Australia', phone: '1800 242 636', website: 'https://www.carersaustralia.com.au', desc: 'National peak body for carers' },
      { name: 'Beyond Blue', phone: '1300 224 636', website: 'https://www.beyondblue.org.au', desc: 'Mental health support 24/7' },
      { name: 'Respite Care', phone: '1800 200 422', website: 'https://www.myagedcare.gov.au/respite-care', desc: 'Short-term relief for carers' },
      { name: 'Carers + Employers', phone: '1300 242 636', website: 'https://www.carergateway.gov.au/working', desc: 'Support for working carers' }
    ],
    legal: [
      { name: 'Legal Aid Australia', phone: '1300 650 579', website: 'https://www.legalaid.vic.gov.au', desc: 'Free legal advice' },
      { name: 'Elder Rights Advocacy', phone: '1800 700 600', website: 'https://www.era.asn.au', desc: 'Protecting rights of older people' },
      { name: 'Office of the Public Advocate', phone: '1300 309 337', website: 'https://www.publicadvocate.vic.gov.au', desc: 'Guardianship and powers of attorney' }
    ],
    health: [
      { name: 'Healthdirect', phone: '1800 022 222', website: 'https://www.healthdirect.gov.au', desc: '24/7 health advice from nurses' },
      { name: 'GP After Hours', phone: '13 SICK (13 7425)', website: 'https://www.homedoctor.com.au', desc: 'After hours GP home visits' },
      { name: 'National Continence Helpline', phone: '1800 330 066', website: 'https://www.continence.org.au', desc: 'Continence advice and support' }
    ]
  },
  usa: {
    name: 'United States',
    flag: '🇺🇸',
    emergency: {
      police: '911',
      ambulance: '911',
      fire: '911',
      crisis: '988 (Suicide & Crisis)',
      domesticViolence: '1-800-799-7233',
      suicide: '988'
    },
    dementia: [
      { name: 'Alzheimer\'s Association', phone: '1-800-272-3900', website: 'https://www.alz.org', desc: '24/7 Helpline in 200+ languages' },
      { name: 'Alzheimer\'s Foundation', phone: '1-866-232-8484', website: 'https://www.alzfdn.org', desc: 'Support and resources' },
      { name: 'National Institute on Aging', phone: '1-800-222-2225', website: 'https://www.nia.nih.gov', desc: 'Research and information center' },
      { name: 'Eldercare Locator', phone: '1-800-677-1116', website: 'https://eldercare.acl.gov', desc: 'Connect to local services' }
    ],
    caregiver: [
      { name: 'Family Caregiver Alliance', phone: '1-800-445-8106', website: 'https://www.caregiver.org', desc: 'National caregiver support' },
      { name: 'ARCH National Respite', phone: '1-703-256-2084', website: 'https://archrespite.org', desc: 'Respite care resources' },
      { name: 'Caregiver Action Network', phone: '1-855-227-3640', website: 'https://caregiveraction.org', desc: 'Education and support' },
      { name: 'AARP Family Caregiving', phone: '1-877-333-5885', website: 'https://www.aarp.org/caregiving', desc: 'Resources and community' }
    ],
    legal: [
      { name: 'National Academy of Elder Law', phone: '1-703-942-5711', website: 'https://www.naela.org', desc: 'Find elder law attorneys' },
      { name: 'Medicare Helpline', phone: '1-800-633-4227', website: 'https://www.medicare.gov', desc: 'Medicare information and support' },
      { name: 'Social Security', phone: '1-800-772-1213', website: 'https://www.ssa.gov', desc: 'Benefits and assistance' }
    ],
    health: [
      { name: 'Veterans Crisis Line', phone: '988 then Press 1', website: 'https://www.veteranscrisisline.net', desc: 'Support for veterans 24/7' },
      { name: 'SAMHSA Helpline', phone: '1-800-662-4357', website: 'https://www.samhsa.gov', desc: 'Mental health and substance abuse' },
      { name: 'National Adult Day Services', phone: '1-877-745-1440', website: 'https://www.nadsa.org', desc: 'Find adult day care programs' }
    ]
  },
  uk: {
    name: 'United Kingdom',
    flag: '🇬🇧',
    emergency: {
      police: '999 or 112',
      ambulance: '999 or 112',
      fire: '999 or 112',
      crisis: '116 123 (Samaritans)',
      domesticViolence: '0808 2000 247',
      suicide: '116 123'
    },
    dementia: [
      { name: 'Alzheimer\'s Society', phone: '0333 150 3456', website: 'https://www.alzheimers.org.uk', desc: 'National Dementia Helpline' },
      { name: 'Dementia UK', phone: '0800 888 6678', website: 'https://www.dementiauk.org', desc: 'Admiral Nurses support' },
      { name: 'Age UK', phone: '0800 678 1602', website: 'https://www.ageuk.org.uk', desc: 'Advice for older people' },
      { name: 'NHS Dementia Guide', phone: '111', website: 'https://www.nhs.uk/conditions/dementia', desc: 'NHS information and services' }
    ],
    caregiver: [
      { name: 'Carers UK', phone: '0808 808 7777', website: 'https://www.carersuk.org', desc: 'National carers advice line' },
      { name: 'Carers Trust', phone: '0300 772 9600', website: 'https://carers.org', desc: 'Support for carers' },
      { name: 'Rethink Mental Illness', phone: '0300 506 0550', website: 'https://www.rethink.org', desc: 'Carer support services' },
      { name: 'The Silver Line', phone: '0800 470 8090', website: 'https://www.thesilverline.org.uk', desc: '24/7 helpline for older people' }
    ],
    legal: [
      { name: 'Citizens Advice', phone: '0800 144 8848', website: 'https://www.citizensadvice.org.uk', desc: 'Free advice on rights and benefits' },
      { name: 'Office of the Public Guardian', phone: '0300 456 0300', website: 'https://www.gov.uk/opg', desc: 'Lasting power of attorney' },
      { name: 'Money Helper', phone: '0800 138 7777', website: 'https://www.moneyhelper.org.uk', desc: 'Free financial guidance' }
    ],
    health: [
      { name: 'NHS 111', phone: '111', website: 'https://www.nhs.uk/nhs-services/urgent-and-emergency-care', desc: 'Non-emergency medical help' },
      { name: 'Mind', phone: '0300 123 3393', website: 'https://www.mind.org.uk', desc: 'Mental health support' },
      { name: 'PANDAS Foundation', phone: '0808 196 4382', website: 'https://www.pandasfoundation.org.uk', desc: 'Perinatal mental health' }
    ]
  },
  canada: {
    name: 'Canada',
    flag: '🇨🇦',
    emergency: {
      police: '911',
      ambulance: '911',
      fire: '911',
      crisis: '1-833-456-4566',
      domesticViolence: '1-800-799-7233',
      suicide: '1-833-456-4566'
    },
    dementia: [
      { name: 'Alzheimer Society of Canada', phone: '1-800-616-8816', website: 'https://alzheimer.ca', desc: 'National dementia support' },
      { name: 'Dementia Society', phone: '1-604-681-6530', website: 'https://www.dementiasociety.org', desc: 'Programs and education' },
      { name: 'Canadian Consortium', phone: '1-416-978-2818', website: 'https://cccdtd.ca', desc: 'Research and resources' }
    ],
    caregiver: [
      { name: 'Family Caregivers BC', phone: '1-877-520-3267', website: 'https://www.familycaregiversbc.ca', desc: 'Caregiver support' },
      { name: 'Caregiver Exchange', phone: '1-844-836-6222', website: 'https://www.caregiverexchange.ca', desc: 'Online caregiver community' },
      { name: 'Canadian Caregiver Coalition', phone: '1-888-866-2273', website: 'https://www.canadiancaregivercoalition.ca', desc: 'National advocacy' }
    ],
    legal: [
      { name: 'Legal Aid Canada', phone: 'Varies by province', website: 'https://www.justice.gc.ca/eng/fund-fina/gov-gouv/aid-aide.html', desc: 'Free legal services' },
      { name: 'Service Canada', phone: '1-800-622-6232', website: 'https://www.canada.ca/en/employment-social-development/corporate/contact.html', desc: 'Government benefits and pensions' }
    ],
    health: [
      { name: 'HealthLink BC', phone: '811', website: 'https://www.healthlinkbc.ca', desc: '24/7 health advice from nurses' },
      { name: 'Crisis Services Canada', phone: '1-833-456-4566', website: 'https://www.crisisservicescanada.ca', desc: 'Mental health crisis support' },
      { name: 'Canadian Mental Health', phone: '1-833-456-4566', website: 'https://cmha.ca', desc: 'Mental health resources' }
    ]
  },
  newzealand: {
    name: 'New Zealand',
    flag: '🇳🇿',
    emergency: {
      police: '111',
      ambulance: '111',
      fire: '111',
      crisis: '1737',
      domesticViolence: '0800 456 450',
      suicide: '0508 828 865'
    },
    dementia: [
      { name: 'Dementia New Zealand', phone: '0800 433 636', website: 'https://www.dementia.nz', desc: 'National dementia support' },
      { name: 'Alzheimers NZ', phone: '0800 004 001', website: 'https://www.alzheimers.org.nz', desc: '24/7 helpline and support' },
      { name: 'Dementia Auckland', phone: '09-620 2922', website: 'https://www.dementiaauckland.org.nz', desc: 'Auckland-based support services' }
    ],
    caregiver: [
      { name: 'Carers New Zealand', phone: '0800 777 797', website: 'https://www.carers.net.nz', desc: 'National support for carers' },
      { name: 'Supporting Families', phone: '0800 732 825', website: 'https://www.supportingfamilies.org.nz', desc: 'Family mental health support' },
      { name: 'Age Concern', phone: '0800 803 344', website: 'https://www.ageconcern.org.nz', desc: 'Elder care and support' }
    ],
    legal: [
      { name: 'Community Law', phone: '0800 267 6848', website: 'https://communitylaw.org.nz', desc: 'Free legal advice' },
      { name: 'Ministry of Social Development', phone: '0800 559 009', website: 'https://www.msd.govt.nz', desc: 'Benefits and support' },
      { name: 'Elder Abuse Response', phone: '0800 32 668 65', website: 'https://www.ea.org.nz', desc: 'Protection services' }
    ],
    health: [
      { name: 'Healthline', phone: '0800 611 116', website: 'https://www.health.govt.nz/your-health/services-and-support/health-care-services/healthline', desc: '24/7 health advice' },
      { name: '1737 Need to Talk?', phone: '1737', website: 'https://1737.org.nz', desc: 'Free mental health support' },
      { name: 'Lifeline', phone: '0800 543 354', website: 'https://www.lifeline.org.nz', desc: 'Crisis support 24/7' }
    ]
  }
};

export default function Resources() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState('australia');
  const [searchQuery, setSearchQuery] = useState('');

  const country = countryResources[selectedCountry];

  const filterResources = (resources) => {
    if (!searchQuery) return resources;
    return resources.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-24">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Caregiver Resources
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Emergency contacts, support services, and helpful information
            </p>
          </div>
        </div>

        {/* Country Selector */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Select Your Country</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(countryResources).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCountry(key)}
                  className={`p-4 rounded-xl transition-all ${
                    selectedCountry === key
                      ? 'bg-white text-slate-900 shadow-lg scale-105'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <div className="text-3xl mb-2">{data.flag}</div>
                  <div className="text-sm font-semibold">{data.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Emergency Contacts */}
        <Card className="mb-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-700 dark:text-red-400">
              <Phone className="w-6 h-6" />
              Emergency Contacts - {country.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(country.emergency).map(([key, number]) => (
                <a
                  key={key}
                  href={`tel:${number}`}
                  className="p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all group"
                >
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400 group-hover:scale-110 transition-transform">
                    {number}
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dementia-Specific Support */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-purple-600" />
              Dementia-Specific Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterResources(country.dementia).map((resource, idx) => (
                <div key={idx} className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{resource.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{resource.desc}</p>
                  <div className="flex flex-col gap-2">
                    <a href={`tel:${resource.phone}`} className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium">
                      <Phone className="w-4 h-4" />
                      {resource.phone}
                    </a>
                    <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {resource.website}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Caregiver Support Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Headphones className="w-6 h-6 text-blue-600" />
              Caregiver Support Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterResources(country.caregiver).map((resource, idx) => (
                <div key={idx} className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{resource.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{resource.desc}</p>
                  <div className="flex flex-col gap-2">
                    <a href={`tel:${resource.phone}`} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">
                      <Phone className="w-4 h-4" />
                      {resource.phone}
                    </a>
                    <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {resource.website}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legal & Financial Resources */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-600" />
              Legal & Financial Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterResources(country.legal).map((resource, idx) => (
                <div key={idx} className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{resource.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{resource.desc}</p>
                  <div className="flex flex-col gap-2">
                    <a href={`tel:${resource.phone}`} className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 font-medium">
                      <Phone className="w-4 h-4" />
                      {resource.phone}
                    </a>
                    <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {resource.website}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health & Mental Health Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-rose-600" />
              Health & Mental Health Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterResources(country.health).map((resource, idx) => (
                <div key={idx} className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{resource.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{resource.desc}</p>
                  <div className="flex flex-col gap-2">
                    <a href={`tel:${resource.phone}`} className="flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium">
                      <Phone className="w-4 h-4" />
                      {resource.phone}
                    </a>
                    <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {resource.website}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* General Resources */}
        <Card className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-amber-600" />
              Helpful Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Understanding Dementia</h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                  <li>Dementia is an umbrella term for conditions affecting memory, thinking, and social abilities</li>
                  <li>Alzheimer's disease accounts for 60-80% of cases</li>
                  <li>Early diagnosis helps with planning and accessing support</li>
                  <li>Many resources are available to help both patients and caregivers</li>
                </ul>
              </div>
              
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Caregiver Self-Care</h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                  <li>Take regular breaks - respite care is essential</li>
                  <li>Join support groups to connect with others</li>
                  <li>Don't hesitate to ask for and accept help</li>
                  <li>Maintain your own health appointments</li>
                  <li>Set realistic expectations and celebrate small wins</li>
                </ul>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">When to Seek Help</h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                  <li>Sudden changes in behavior or confusion</li>
                  <li>Signs of depression or anxiety</li>
                  <li>Difficulty managing medications</li>
                  <li>Safety concerns at home</li>
                  <li>Caregiver burnout or exhaustion</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          <p>⚠️ In case of emergency, always call your local emergency number</p>
          <p className="mt-2">Information provided is for reference only. Please verify with local authorities.</p>
        </div>
      </div>

      <PageLoadTip pageName="Resources" />
    </div>
  );
}