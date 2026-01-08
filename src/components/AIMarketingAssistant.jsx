import { useState } from 'react'
import { Sparkles, ChevronRight, Facebook, Instagram, Twitter, Linkedin, Download, Copy, RefreshCw, Image as ImageIcon, Clock, CheckCircle } from 'lucide-react'

export default function AIMarketingAssistant({ onClose }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({
    businessType: '',
    targetAudience: '',
    budget: '',
    goals: '',
    uniqueValue: '',
    campaignFocus: '',
    timeAvailable: '',
    currentSocialMedia: ''
  })
  const [recommendations, setRecommendations] = useState(null)
  const [captions, setCaptions] = useState([])
  const [selectedCaption, setSelectedCaption] = useState('')
  const [imagePrompts, setImagePrompts] = useState([])
  const [selectedImagePrompt, setSelectedImagePrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [marketingApproach, setMarketingApproach] = useState(null)

  const questions = [
    {
      id: 'businessType',
      question: 'What type of business are you running?',
      placeholder: 'e.g., Handmade crafts, Food business, Tech startup...',
      icon: '🏪'
    },
    {
      id: 'targetAudience',
      question: 'Who is your target audience?',
      placeholder: 'e.g., Young professionals, Parents, Students...',
      icon: '🎯'
    },
    {
      id: 'timeAvailable',
      question: 'How much time can you spend on marketing per week?',
      type: 'select',
      options: [
        { value: '0-2', label: '0-2 hours (Very busy)' },
        { value: '3-5', label: '3-5 hours (Limited time)' },
        { value: '6-10', label: '6-10 hours (Moderate time)' },
        { value: '10+', label: '10+ hours (Plenty of time)' }
      ],
      icon: '⏰'
    },
    {
      id: 'budget',
      question: 'What is your marketing budget per month?',
      placeholder: 'e.g., ₹5,000, ₹20,000, ₹50,000...',
      icon: '💰'
    },
    {
      id: 'currentSocialMedia',
      question: 'Which social media platforms do you currently use?',
      type: 'multiselect',
      options: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube', 'WhatsApp'],
      icon: '📱'
    },
    {
      id: 'goals',
      question: 'What are your main marketing goals?',
      placeholder: 'e.g., Increase awareness, Get more backers, Build brand...',
      icon: '🎯'
    },
    {
      id: 'uniqueValue',
      question: 'What makes your business unique?',
      placeholder: 'e.g., Eco-friendly, Handmade, Innovative technology...',
      icon: '⭐'
    },
    {
      id: 'campaignFocus',
      question: 'What should we focus on in your campaign?',
      placeholder: 'e.g., Product quality, Price, Social impact...',
      icon: '🔍'
    }
  ]

  function handleAnswerChange(questionId, value) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  function handleMultiSelectToggle(questionId, option) {
    const current = answers[questionId] || ''
    const selected = current ? current.split(',') : []
    
    if (selected.includes(option)) {
      const updated = selected.filter(item => item !== option)
      setAnswers(prev => ({ ...prev, [questionId]: updated.join(',') }))
    } else {
      selected.push(option)
      setAnswers(prev => ({ ...prev, [questionId]: selected.join(',') }))
    }
  }

  function handleNextQuestion() {
    if (step < questions.length) {
      setStep(step + 1)
    } else {
      generateRecommendations()
    }
  }

  function determineMarketingApproach(timeAvailable) {
    const hours = timeAvailable.split('-')[0]
    
    if (hours === '0' || parseInt(hours) <= 2) {
      return {
        type: 'AI-Powered',
        percentage: 90,
        description: 'Heavily automated with AI assistance',
        color: 'purple',
        recommendations: [
          'Use AI tools to schedule all posts in advance',
          'Automate responses to common questions',
          'Set up AI-powered ad campaigns',
          'Use chatbots for customer engagement',
          'Batch create content once a week using AI'
        ]
      }
    } else if (parseInt(hours) <= 5) {
      return {
        type: 'Hybrid (70% AI, 30% Manual)',
        percentage: 70,
        description: 'AI-assisted with personal touch',
        color: 'blue',
        recommendations: [
          'Use AI for content creation and scheduling',
          'Manually engage with top comments daily (15 min)',
          'Review AI-generated posts before publishing',
          'Personalize key customer interactions',
          'Use AI analytics to guide strategy'
        ]
      }
    } else if (parseInt(hours) <= 10) {
      return {
        type: 'Balanced (50% AI, 50% Manual)',
        percentage: 50,
        description: 'Perfect mix of automation and personal engagement',
        color: 'green',
        recommendations: [
          'AI generates content ideas and drafts',
          'Manually customize and polish each post',
          'Engage personally with followers daily',
          'Use AI for analytics and scheduling',
          'Create some content from scratch weekly'
        ]
      }
    } else {
      return {
        type: 'Manual with AI Support',
        percentage: 30,
        description: 'Hands-on approach with AI tools',
        color: 'orange',
        recommendations: [
          'Create most content manually for authenticity',
          'Use AI for keyword research and trends',
          'Personally engage with all followers',
          'Leverage AI for performance analytics',
          'Build genuine community connections'
        ]
      }
    }
  }

  function generateRecommendations() {
    setGenerating(true)
    
    setTimeout(() => {
      const approach = determineMarketingApproach(answers.timeAvailable)
      setMarketingApproach(approach)
      
      const platforms = answers.currentSocialMedia ? answers.currentSocialMedia.split(',') : []
      
      const recs = {
        approach: approach,
        strategy: [
          `Focus on ${answers.targetAudience} through ${platforms.join(', ')}`,
          `Highlight your ${answers.uniqueValue} in all marketing materials`,
          `Allocate ${answers.budget} strategically across digital channels`,
          `Emphasize ${answers.campaignFocus} to differentiate from competitors`,
          `Spend ${answers.timeAvailable} hours/week on ${approach.type.toLowerCase()} marketing`
        ],
        channels: platforms.map(platform => ({
          name: platform,
          priority: platforms.indexOf(platform) < 2 ? 'High' : 'Medium',
          reason: `You're already active here`,
          automation: approach.percentage > 50 ? 'Recommended' : 'Optional'
        })),
        contentIdeas: [
          `Behind-the-scenes of your ${answers.businessType}`,
          `Customer testimonials showcasing ${answers.uniqueValue}`,
          `Educational content about ${answers.campaignFocus}`,
          `Product demos targeting ${answers.targetAudience}`,
          `Success stories and milestones`,
          `User-generated content campaigns`,
          `Live Q&A sessions about your business`
        ],
        timing: {
          bestDays: ['Monday', 'Wednesday', 'Friday'],
          bestTimes: ['9:00 AM - 11:00 AM', '6:00 PM - 8:00 PM'],
          frequency: approach.percentage > 70 ? 'Daily (automated)' : '3-4 posts per week'
        }
      }
      
      setRecommendations(recs)
      generateCaptions()
      generateImagePrompts()
      setGenerating(false)
      setStep(step + 1)
    }, 2000)
  }

  function generateCaptions() {
    const sampleCaptions = [
      `🌟 Discover ${answers.businessType} that's ${answers.uniqueValue}! Perfect for ${answers.targetAudience}. Join our journey today! 🚀\n\n#Innovation #${answers.businessType.replace(/\s+/g, '')} #SupportLocal #${answers.campaignFocus.replace(/\s+/g, '')}`,
      
      `💡 Why choose us? Because we focus on ${answers.campaignFocus}! Designed especially for ${answers.targetAudience} who value quality.\n\n✨ Support our campaign and be part of something amazing!\n\n#Quality #${answers.uniqueValue.replace(/\s+/g, '')} #CommunityFirst`,
      
      `🎯 Calling all ${answers.targetAudience}! \n\nExperience ${answers.uniqueValue} ${answers.businessType}. Every backer makes a difference! 💪\n\n👉 Click the link in bio to support us!\n\n#CrowdfundingSuccess #MakeADifference`,
      
      `✨ Transform your life with our ${answers.businessType}!\n\n${answers.uniqueValue} ✓\nBuilt with love ✓\nPerfect for ${answers.targetAudience} ✓\n\nBack us today! 🌈\n\n#Innovation #StartupLife #${answers.goals.replace(/\s+/g, '')}`,
      
      `🚀 BIG NEWS! We're focusing on ${answers.campaignFocus} and need YOUR support!\n\nPerfect for: ${answers.targetAudience}\nWhat makes us special: ${answers.uniqueValue}\n\nJoin the movement! Link in bio 🔥\n\n#Fundraising #GameChanger #SupportSmallBusiness`,
      
      `Hey ${answers.targetAudience}! 👋\n\nLooking for ${answers.businessType} that's different? We've got you covered!\n\n🎁 ${answers.uniqueValue}\n🎯 ${answers.campaignFocus}\n💚 Made with passion\n\nBe an early supporter! ⬇️\n\n#BackUs #Innovation`,
      
      `🌟 EXCITING UPDATE! 🌟\n\nOur ${answers.businessType} is changing the game for ${answers.targetAudience}!\n\nWhat sets us apart:\n✅ ${answers.uniqueValue}\n✅ Focus on ${answers.campaignFocus}\n✅ Community-driven\n\nSupport us today!\n\n#CommunityPower #StartupJourney`
    ]
    
    setCaptions(sampleCaptions)
    setSelectedCaption(sampleCaptions[0])
  }

  function generateImagePrompts() {
    const prompts = [
      `Professional photo of ${answers.businessType} with ${answers.uniqueValue}, modern style, bright colors`,
      `${answers.targetAudience} using ${answers.businessType}, lifestyle photography, happy and satisfied`,
      `Close-up of ${answers.businessType} showing ${answers.campaignFocus}, high quality, detailed`,
      `Before and after comparison showing impact of ${answers.businessType}, split screen design`,
      `Infographic about ${answers.uniqueValue} with statistics and icons, professional design`,
      `Team working on ${answers.businessType}, behind the scenes, authentic and genuine`,
      `Quote graphic: "${answers.goals}" with your business logo and colors`
    ]
    
    setImagePrompts(prompts)
    setSelectedImagePrompt(prompts[0])
  }

  function handleGenerateImage() {
    setGenerating(true)
    
    setTimeout(() => {
      const imageUrl = `https://via.placeholder.com/1080x1080/6366f1/ffffff?text=${encodeURIComponent(answers.businessType.substring(0, 20) + '\n' + answers.uniqueValue.substring(0, 20))}`
      setGeneratedImage(imageUrl)
      setGenerating(false)
    }, 2000)
  }

  function handleCopyCaption() {
    navigator.clipboard.writeText(selectedCaption)
    alert('✅ Caption copied to clipboard!')
  }

  function handleShareTo(platform) {
    const text = encodeURIComponent(selectedCaption)
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`,
      instagram: 'https://www.instagram.com/'
    }
    
    if (platform === 'instagram') {
      alert('📱 Instagram: Copy caption and image, then open Instagram app to post!\n\nCaption copied to clipboard!')
      navigator.clipboard.writeText(selectedCaption)
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={32} />
              <div>
                <h2 className="text-2xl font-bold">AI Marketing Assistant</h2>
                <p className="text-sm text-purple-100">Personalized strategy based on your time & goals</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:text-purple-600 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span>Step {Math.min(step, questions.length)} of {questions.length}</span>
              <span>{Math.round((Math.min(step, questions.length) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-purple-400 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${(Math.min(step, questions.length) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Questions Phase */}
          {step <= questions.length && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">{questions[step - 1].icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {questions[step - 1].question}
                </h3>
                <p className="text-gray-600 text-sm">This helps us create better recommendations for you</p>
              </div>

              <div>
                {questions[step - 1].type === 'select' ? (
                  <div className="space-y-3">
                    {questions[step - 1].options.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswerChange(questions[step - 1].id, option.value)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition ${
                          answers[questions[step - 1].id] === option.value
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">{option.label}</span>
                          {answers[questions[step - 1].id] === option.value && (
                            <CheckCircle className="text-purple-600" size={24} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : questions[step - 1].type === 'multiselect' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {questions[step - 1].options.map(option => {
                      const selected = answers[questions[step - 1].id]?.split(',').includes(option)
                      return (
                        <button
                          key={option}
                          onClick={() => handleMultiSelectToggle(questions[step - 1].id, option)}
                          className={`p-4 rounded-lg border-2 text-center transition ${
                            selected
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          <div className="font-semibold text-gray-800">{option}</div>
                          {selected && <CheckCircle className="text-purple-600 mx-auto mt-2" size={20} />}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <textarea
                    value={answers[questions[step - 1].id]}
                    onChange={(e) => handleAnswerChange(questions[step - 1].id, e.target.value)}
                    placeholder={questions[step - 1].placeholder}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none resize-none"
                    rows={4}
                    autoFocus
                  />
                )}
              </div>

              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    ← Previous
                  </button>
                )}
                <button
                  onClick={handleNextQuestion}
                  disabled={!answers[questions[step - 1].id]}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {step === questions.length ? '✨ Generate My Strategy' : 'Next'}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Generating Phase */}
          {generating && step > questions.length && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">AI is analyzing your inputs...</h3>
              <p className="text-gray-600">Creating personalized marketing strategy</p>
            </div>
          )}

          {/* Results Phase */}
          {step > questions.length && recommendations && !generating && (
            <div className="space-y-6">
              {/* Marketing Approach Recommendation */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-300">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="text-purple-600" size={32} />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Your Recommended Approach</h3>
                    <p className="text-gray-600 text-sm">Based on {answers.timeAvailable} hours/week available</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{marketingApproach.type}</h4>
                      <p className="text-gray-600">{marketingApproach.description}</p>
                    </div>
                    <div className="text-4xl font-bold text-purple-600">
                      {marketingApproach.percentage}% AI
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all"
                      style={{ width: `${marketingApproach.percentage}%` }}
                    ></div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-gray-800 mb-2">How to implement:</p>
                    {marketingApproach.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">✓</span>
                        <span className="text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Generated Captions */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  ✨ AI Generated Captions ({captions.length} options)
                </h3>
                
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {captions.map((caption, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedCaption(caption)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedCaption === caption
                          ? 'border-blue-600 bg-blue-100'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-bold text-blue-600">Option {idx + 1}</span>
                        {selectedCaption === caption && (
                          <CheckCircle className="text-blue-600" size={16} />
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-line text-sm">{caption}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCaption}
                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition flex items-center justify-center gap-2"
                  >
                    <Copy size={18} />
                    Copy Selected
                  </button>
                  <button
                    onClick={generateCaptions}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <RefreshCw size={18} />
                    More
                  </button>
                </div>
              </div>

              {/* Image Prompts & Generator */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🎨 AI Image Suggestions
                </h3>
                
                <div className="space-y-3 mb-4">
                  <p className="text-sm text-gray-600">Select an image style to generate:</p>
                  {imagePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImagePrompt(prompt)}
                      className={`w-full p-3 rounded-lg border-2 text-left text-sm transition ${
                        selectedImagePrompt === prompt
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{prompt}</span>
                        {selectedImagePrompt === prompt && (
                          <CheckCircle className="text-indigo-600" size={20} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {!generatedImage ? (
                  <button
                    onClick={handleGenerateImage}
                    disabled={generating}
                    className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <ImageIcon size={20} />
                    {generating ? 'Generating Image...' : 'Generate Post Image'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={generatedImage}
                        alt="Generated marketing post"
                        className="w-full rounded-lg shadow-lg"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ✓ Ready to post
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={generatedImage}
                        download="marketing-post.png"
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Download
                      </a>
                      <button
                        onClick={handleGenerateImage}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
                      >
                        <RefreshCw size={18} />
                        Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media Share Buttons */}
              <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-lg p-6 border-2 border-pink-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🚀 Post to Your Social Media
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleShareTo('facebook')}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Facebook size={20} />
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShareTo('instagram')}
                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Instagram size={20} />
                    Instagram
                  </button>
                  <button
                    onClick={() => handleShareTo('twitter')}
                    className="px-4 py-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition flex items-center justify-center gap-2"
                  >
                    <Twitter size={20} />
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShareTo('linkedin')}
                    className="px-4 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition flex items-center justify-center gap-2"
                  >
                    <Linkedin size={20} />
                    LinkedIn
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setStep(1)
                    setRecommendations(null)
                    setCaptions([])
                    setImagePrompts([])
                    setGeneratedImage(null)
                    setMarketingApproach(null)
                  }}
                  className="flex-1 px-6 py-3 border-2 border-purple-300 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
                >
                  🔄 Start Over
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  ✅ Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
