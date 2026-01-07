import axios from 'axios'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

async function callGemini(prompt) {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      }
    )
    
    return response.data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error('Gemini Error:', error.response?.data || error.message)
    throw error
  }
}

export async function testOpenAI() {
  const response = await callGemini('Say "Hello from Gemini!"')
  return response
}

export async function getRecommendations(businessData) {
  const prompt = `You are a business growth advisor for small Indian businesses. Based on these constraints:

Budget: ₹${businessData.budget}/month
Time Available: ${businessData.time} hours/week
Business Type: ${businessData.businessType}
Products: ${businessData.products}
Current Customers: ${businessData.customers}
Goal: ${businessData.goal}

Provide EXACTLY 5 actionable recommendations as a JSON array. Each recommendation must have:
- id (number)
- action (string)
- description (string)
- tool (string)
- automationLevel (one of: "🤖 Automated", "🤝 AI-Assisted", "👤 Manual")
- timeNeeded (string like "2 hours/week")
- cost (string like "₹5000")
- whyItMatters (string)

Important rules:
- If budget < ₹5000, recommend only FREE tools
- If time < 3 hours/week, recommend AUTOMATED solutions
- Use realistic Indian context
- Return ONLY valid JSON array, no markdown, no explanation

Example format:
[{"id":1,"action":"Create Instagram Profile","description":"Set up free business account","tool":"Instagram","automationLevel":"🤝 AI-Assisted","timeNeeded":"2 hours/week","cost":"₹0","whyItMatters":"Reach local customers"}]`

  try {
    const response = await callGemini(prompt)
    
    // Clean response
    let cleanResponse = response.trim()
    cleanResponse = cleanResponse.replace(/```json\n?|\n?```/g, '')
    cleanResponse = cleanResponse.replace(/```\n?/g, '')
    
    // Extract JSON array
    const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch)
    }
    
    return JSON.parse(cleanResponse)
  } catch (error) {
    console.error('Error getting recommendations:', error)
    alert('AI is processing... Using backup recommendations')
    return getBackupRecommendations(businessData)
  }
}

export async function generateSocialMediaPosts(businessData) {
  const prompt = `Write 3 Instagram posts for a ${businessData.businessType} business selling "${businessData.products}" in India.

Each post should be 80-120 words with emojis and hashtags.

Return ONLY a JSON array in this exact format:
[{"post":"Post text with emojis","hashtags":"#Tag1 #Tag2"}]

No markdown, no explanation, just the JSON array.`

  try {
    const response = await callGemini(prompt)
    
    let cleanResponse = response.trim()
    cleanResponse = cleanResponse.replace(/```json\n?|\n?```/g, '')
    cleanResponse = cleanResponse.replace(/```\n?/g, '')
    
    const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return JSON.parse(cleanResponse)
  } catch (error) {
    console.error('Error generating posts:', error)
    return getBackupPosts(businessData)
  }
}

export async function improvePitch(pitch) {
  const prompt = `Improve this pitch for an Indian small business. Make it compelling and under 150 words:

"${pitch}"

Return ONLY the improved pitch text, nothing else.`

  try {
    const response = await callGemini(prompt)
    return response.trim()
  } catch (error) {
    console.error('Error improving pitch:', error)
    return pitch
  }
}

// Backup functions if Gemini fails
function getBackupRecommendations(businessData) {
  const isBudgetLimited = businessData.budget < 5000
  const isTimeLimited = businessData.time < 3
  
  return [
    {
      id: 1,
      action: isBudgetLimited ? "Create Instagram Business Profile" : "Run Instagram Ads",
      description: `Visual platform perfect for showcasing ${businessData.products}`,
      tool: isBudgetLimited ? "Instagram (Free)" : "Meta Ads",
      automationLevel: isTimeLimited ? "🤖 Automated" : "🤝 AI-Assisted",
      timeNeeded: isTimeLimited ? "1 hour/week" : "2 hours/week",
      cost: isBudgetLimited ? "₹0" : `₹${Math.min(businessData.budget * 0.6, 8000)}`,
      whyItMatters: `Reach 5,000+ local customers searching for ${businessData.products.toLowerCase()}`
    },
    {
      id: 2,
      action: "Use Canva for Design",
      description: "Create professional posts without design skills",
      tool: "Canva (Free)",
      automationLevel: "🤖 Automated",
      timeNeeded: "30 min/week",
      cost: "₹0",
      whyItMatters: "Professional visuals increase engagement by 300%"
    },
    {
      id: 3,
      action: businessData.budget > 5000 ? "Email Marketing" : "WhatsApp Business",
      description: "Direct customer communication",
      tool: businessData.budget > 5000 ? "Mailchimp" : "WhatsApp Business",
      automationLevel: "🤝 AI-Assisted",
      timeNeeded: "1.5 hours/week",
      cost: businessData.budget > 5000 ? "₹800" : "₹0",
      whyItMatters: "Convert 30% more inquiries into sales"
    },
    {
      id: 4,
      action: "Google My Business Listing",
      description: "Appear in local Google searches",
      tool: "Google My Business (Free)",
      automationLevel: "👤 Manual",
      timeNeeded: "1 hour setup + 15 min/week",
      cost: "₹0",
      whyItMatters: "70% of customers search locally before buying"
    },
    {
      id: 5,
      action: businessData.time > 5 ? "Create YouTube Videos" : "Share Testimonials",
      description: "Build trust through content",
      tool: businessData.time > 5 ? "YouTube" : "Instagram Stories",
      automationLevel: businessData.time > 5 ? "👤 Manual" : "🤝 AI-Assisted",
      timeNeeded: businessData.time > 5 ? "3 hours/week" : "45 min/week",
      cost: "₹0",
      whyItMatters: "Increase conversion by 80%"
    }
  ]
}

function getBackupPosts(businessData) {
  return [
    {
      post: `✨ Fresh ${businessData.products} made with love! 🌟\n\nQuality you can trust, delivered to your doorstep. 🚚\n\nDM us to order! 📱`,
      hashtags: `#SmallBusiness #${businessData.businessType.replace(/\s+/g, '')} #SupportLocal #MadeInIndia`
    },
    {
      post: `🎉 Special offer this week! 🎁\n\nAmazing deals on ${businessData.products.toLowerCase()}.\n\nTag someone! 👇`,
      hashtags: `#WeekendSpecial #Offers #ShopLocal #SupportSmallBusiness`
    },
    {
      post: `❤️ Thank you for your support! 🙏\n\nEvery ${businessData.products.toLowerCase()} is made with passion. ✨`,
      hashtags: `#CustomerLove #ThankYou #SupportLocal #Community`
    }
  ]
}
