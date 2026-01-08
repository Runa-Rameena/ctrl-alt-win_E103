const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export async function getAIRecommendations(businessData) {
  const prompt = `You are a business growth consultant. Analyze this business and provide 3-4 specific, actionable growth strategies.

Business Details:
- Type: ${businessData.businessType}
- Current Revenue: ${businessData.currentRevenue || 'Not specified'}
- Monthly Budget: ${businessData.monthlyBudget || 'Limited'}
- Time Available: ${businessData.timeAvailable || 'Limited'}
- Goals: ${businessData.goals}
- Challenges: ${businessData.currentChallenges || 'None specified'}

Provide recommendations in this EXACT JSON format (no markdown, just pure JSON):
{
  "strategies": [
    {
      "title": "Strategy name",
      "description": "Brief description",
      "cost": "Free/Low/Medium (specify amount if possible)",
      "timeRequired": "X hours per week",
      "automationLevel": "Fully Automated/AI-Assisted/Manual",
      "steps": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "keyInsight": "One important insight based on their constraints"
}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const data = await response.json()
    const text = data.candidates[0].content.parts[0].text
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Gemini API Error:', error)
    return {
      strategies: [
        {
          title: "Social Media Marketing",
          description: "Build your brand presence on Instagram and Facebook with engaging content",
          cost: "Free",
          timeRequired: "3-5 hours per week",
          automationLevel: "AI-Assisted",
          steps: [
            "Create business accounts on Instagram and Facebook",
            "Post high-quality photos of your products 3-4 times per week",
            "Use relevant hashtags to reach your target audience",
            "Engage with followers by responding to comments and messages"
          ]
        },
        {
          title: "Customer Referral Program",
          description: "Turn your happy customers into brand ambassadors",
          cost: "Low (discount costs only)",
          timeRequired: "2 hours per week",
          automationLevel: "Manual",
          steps: [
            "Offer 10% discount for customers who refer friends",
            "Create simple referral cards to give to customers",
            "Track referrals and reward customers promptly",
            "Thank customers publicly on social media"
          ]
        },
        {
          title: "Local Community Partnerships",
          description: "Collaborate with complementary local businesses",
          cost: "Free",
          timeRequired: "4 hours per week",
          automationLevel: "Manual",
          steps: [
            "Identify 3-5 non-competing businesses in your area",
            "Propose cross-promotion or bundled offerings",
            "Display each other's business cards or flyers",
            "Share each other's posts on social media"
          ]
        }
      ],
      keyInsight: "Focus on low-cost, high-impact strategies that leverage your existing customer relationships and local community connections."
    }
  }
}

export async function generateSocialMediaPosts(businessData, recommendations) {
  const prompt = `Create 3 engaging social media posts for ${businessData.businessType}.

Business Context:
- Goals: ${businessData.goals}
- Strategies: ${recommendations.strategies.map(s => s.title).join(', ')}

Create posts in this EXACT JSON format (no markdown):
[
  {
    "post": "Engaging post text (2-3 sentences, include emoji)",
    "hashtags": "#relevanthashtag1 #relevanthashtag2 #relevanthashtag3"
  }
]

Make posts authentic, relatable, and action-oriented. Include emojis naturally.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const data = await response.json()
    const text = data.candidates[0].content.parts[0].text
    
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Gemini API Error:', error)
    return [
      {
        post: "🌟 Your support means the world to us! Every purchase helps our small business grow and serve you better. Thank you for choosing local! 💚",
        hashtags: "#SupportLocal #SmallBusiness #ShopSmall #CommunityFirst #LocalLove"
      },
      {
        post: "✨ Behind every product is a story of passion and dedication. We pour our hearts into everything we create, just for you! 🎨💖",
        hashtags: "#Handmade #SmallBusinessOwner #MadeWithLove #SupportSmallBusiness #LocalArtisan"
      },
      {
        post: "🎉 New week, new opportunities! What are your goals this week? Share below and let's inspire each other! 💪✨",
        hashtags: "#MondayMotivation #SmallBusinessLife #Entrepreneur #GrowthMindset #CommunitySupport"
      }
    ]
  }
}
