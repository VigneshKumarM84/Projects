
// 10-day Hindi lesson plan with progressively difficult sentences
export interface LessonItem {
  hindi: string;
  english: string;
}

export interface Lesson {
  day: number;
  title: string;
  description: string;
  sentences: LessonItem[];
}

export const lessons: Lesson[] = [
  {
    day: 1,
    title: "Basic Greetings & Introductions",
    description: "Learn simple greetings and how to introduce yourself",
    sentences: [
      { hindi: "नमस्ते।", english: "Hello." },
      { hindi: "मेरा नाम राहुल है।", english: "My name is Rahul." },
      { hindi: "आप कैसे हैं?", english: "How are you?" },
      { hindi: "मैं ठीक हूँ।", english: "I am fine." },
      { hindi: "शुभ प्रभात।", english: "Good morning." }
    ]
  },
  {
    day: 2,
    title: "Simple Statements",
    description: "Practice making basic statements about yourself",
    sentences: [
      { hindi: "मैं भारत से हूँ।", english: "I am from India." },
      { hindi: "मुझे हिंदी सीखना पसंद है।", english: "I like learning Hindi." },
      { hindi: "आज मौसम अच्छा है।", english: "The weather is good today." },
      { hindi: "यह मेरा घर है।", english: "This is my house." },
      { hindi: "वह मेरी बहन है।", english: "She is my sister." }
    ]
  },
  {
    day: 3,
    title: "Questions & Answers",
    description: "Learn to ask and answer simple questions",
    sentences: [
      { hindi: "आप कहाँ रहते हैं?", english: "Where do you live?" },
      { hindi: "मैं दिल्ली में रहता हूँ।", english: "I live in Delhi." },
      { hindi: "क्या आप चाय पीना चाहेंगे?", english: "Would you like to drink tea?" },
      { hindi: "हाँ, धन्यवाद।", english: "Yes, thank you." },
      { hindi: "क्या आप अंग्रेजी बोलते हैं?", english: "Do you speak English?" }
    ]
  },
  {
    day: 4,
    title: "Daily Activities",
    description: "Talk about regular activities and routines",
    sentences: [
      { hindi: "मैं सुबह जल्दी उठता हूँ।", english: "I wake up early in the morning." },
      { hindi: "वह रोज़ सुबह व्यायाम करती है।", english: "She exercises every morning." },
      { hindi: "हम शाम को पार्क में टहलते हैं।", english: "We walk in the park in the evening." },
      { hindi: "मैं रात को देर से सोता हूँ।", english: "I sleep late at night." },
      { hindi: "बच्चे स्कूल जाते हैं।", english: "Children go to school." }
    ]
  },
  {
    day: 5,
    title: "Food & Dining",
    description: "Vocabulary and phrases related to food",
    sentences: [
      { hindi: "मुझे भारतीय खाना बहुत पसंद है।", english: "I like Indian food very much." },
      { hindi: "क्या आप मसालेदार खाना खा सकते हैं?", english: "Can you eat spicy food?" },
      { hindi: "यह दाल बहुत स्वादिष्ट है।", english: "This lentil soup is very tasty." },
      { hindi: "कृपया मुझे एक गिलास पानी दीजिए।", english: "Please give me a glass of water." },
      { hindi: "हम रेस्तरां में खाना खाते हैं।", english: "We eat food at the restaurant." }
    ]
  },
  {
    day: 6,
    title: "Travel & Directions",
    description: "Useful phrases for navigating and asking directions",
    sentences: [
      { hindi: "स्टेशन कहाँ है?", english: "Where is the station?" },
      { hindi: "मैं पहली बार भारत आया हूँ।", english: "I have come to India for the first time." },
      { hindi: "कृपया सीधे जाकर बाएँ मुड़िए।", english: "Please go straight and turn left." },
      { hindi: "यहाँ से बाज़ार कितनी दूर है?", english: "How far is the market from here?" },
      { hindi: "क्या आप मुझे रास्ता बता सकते हैं?", english: "Can you tell me the way?" }
    ]
  },
  {
    day: 7,
    title: "Feelings & Emotions",
    description: "Express your feelings and emotions",
    sentences: [
      { hindi: "मैं आज बहुत खुश हूँ।", english: "I am very happy today." },
      { hindi: "मुझे चिंता हो रही है।", english: "I am feeling worried." },
      { hindi: "वह बहुत उदास लग रहा है।", english: "He looks very sad." },
      { hindi: "मुझे यह फिल्म देखकर बहुत आनंद आया।", english: "I enjoyed watching this movie a lot." },
      { hindi: "मुझे अपनी गलती पर पछतावा है।", english: "I regret my mistake." }
    ]
  },
  {
    day: 8,
    title: "Complex Sentences",
    description: "Practice forming more complex sentence structures",
    sentences: [
      { hindi: "अगर कल बारिश हुई, तो हम पिकनिक पर नहीं जाएंगे।", english: "If it rains tomorrow, we will not go for a picnic." },
      { hindi: "जब मैं छोटा था, तब मैं अक्सर पार्क में खेलता था।", english: "When I was young, I often used to play in the park." },
      { hindi: "मैंने उसे बताया कि मैं कल नहीं आ पाऊंगा।", english: "I told him that I wouldn't be able to come tomorrow." },
      { hindi: "हालांकि मेरे पास समय कम है, मैं आपकी मदद करूंगा।", english: "Although I have little time, I will help you." },
      { hindi: "जिस किताब के बारे में आपने बताया था, मैंने उसे खरीद लिया है।", english: "I have bought the book you told me about." }
    ]
  },
  {
    day: 9,
    title: "Cultural Expressions",
    description: "Learn culturally significant phrases and idioms",
    sentences: [
      { hindi: "अतिथि देवो भव। (अतिथि देवो भव:)", english: "The guest is equivalent to God. (A traditional saying)" },
      { hindi: "जैसी करनी वैसी भरनी।", english: "As you sow, so shall you reap." },
      { hindi: "एक हाथ से ताली नहीं बजती।", english: "It takes two to tango. (Lit: You can't clap with one hand)" },
      { hindi: "हाथी के दांत दिखाने के और, खाने के और।", english: "Actions speak louder than words. (Lit: Elephant's teeth for show are different from those for eating)" },
      { hindi: "दाल में कुछ काला है।", english: "Something is fishy. (Lit: There's something black in the lentils)" }
    ]
  },
  {
    day: 10,
    title: "Advanced Conversation",
    description: "Master complex conversations and discussions",
    sentences: [
      { hindi: "मेरा मानना है कि शिक्षा हर बच्चे का अधिकार होना चाहिए।", english: "I believe that education should be the right of every child." },
      { hindi: "पर्यावरण संरक्षण के लिए हमें अपनी जीवनशैली में बदलाव लाना होगा।", english: "We will have to bring changes in our lifestyle for environmental conservation." },
      { hindi: "आधुनिक तकनीक ने मानव जीवन को सरल बना दिया है, लेकिन कुछ चुनौतियां भी पैदा की हैं।", english: "Modern technology has simplified human life, but has also created some challenges." },
      { hindi: "मैं भारतीय संस्कृति की विविधता और समृद्धि से बहुत प्रभावित हूँ।", english: "I am very impressed by the diversity and richness of Indian culture." },
      { hindi: "स्वस्थ जीवन के लिए संतुलित आहार और नियमित व्यायाम आवश्यक है।", english: "A balanced diet and regular exercise are essential for a healthy life." }
    ]
  }
];
