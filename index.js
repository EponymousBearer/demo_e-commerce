import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import multer from 'multer';
import userRouter from './Routes/user.js'
import AWS from 'aws-sdk';
import fs from 'fs'
import { createClient } from '@deepgram/sdk'
import session from "express-session";
import cron from 'node-cron';
import userSession from './Model/UserSession.js'
import Groq from 'groq-sdk'

const PORT = process.env.PORT || 5003;
dotenv.config();
const app = express();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.get("/", (req, res) => res.status(200).send("Hello world"));
app.use(session({
  secret: 'secret', // Change this to a random string
  resave: false,
  saveUninitialized: true
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Specify the destination folder to store the uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix); // Rename the file to avoid conflicts
  },
});
const upload = multer({ storage });
////////////////////////////////////////////////////////////////////////////

app.use("/auth", userRouter);
app.post('/ap', async (req, res) => {
  try {
    let audioData = req.body.audio; // Accessing the audio data from the request body

    // Remove data URI prefix
    const base64DataWithoutPrefix = audioData.replace(/^data:audio\/wav;base64,/, '');

    // Convert base64 to binary buffer
    const binaryData = Buffer.from(base64DataWithoutPrefix, 'base64');

    // Write binary data to .wav file 
    fs.writeFileSync('audio.wav', binaryData);
    console.log('Audio file saved as audio.wav');

    // Call transcribeFile with the file path
    const transcript = await transcribeFile('audio.wav');
    // const aiResponse = await getAIResponse(transcript);

    console.log(transcript);


    res.json({ transcript });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: 'Error processing audio' });
  }
});
const transcribeFile = async (filePath) => {
  console.log('object');
  // STEP 1: Create a Deepgram client using the API key
  const deepgram = createClient('1cee0be838346e426c7ccc86283a04d69ca850b3');

  // STEP 2: Call the transcribeFile method with the audio payload and options
  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    // path to the audio file
    fs.readFileSync(filePath),
    // STEP 3: Configure Deepgram options for audio analysis
    {
      model: "nova-2",
      smart_format: true,
    }
  );

  if (error) throw error;
  // STEP 4: Print the results

  if (!error) {
    return result.results.channels[0].alternatives[0].transcript;
  };
};

AWS.config.update({
  accessKeyId: 'AKIAU5FA3AS4N3SGVO6F',
  secretAccessKey: '0Uo18kboBtarVYXR3qciKeRfiTEDDt5fN8aQtyle',
  region: 'us-east-1', // Change to your region
});

const groq = new Groq({
  apiKey: process.env.groq
});

let story=`  

Q who are the founders of WebTose?
A: Jibran and Adnan are the Founder of WebTose.

Q: What is WebTose?
A: WebTose is an innovative player in the IT domain, dedicated to revolutionizing business-technology engagement.

Q: Can you tell me about WebTose?
A: WebTose is committed to delivering cutting-edge solutions tailored to evolving business needs in the IT sector.

Q: What does WebTose specialize in?
A: WebTose specializes in providing chatbot solutions, website development, e-commerce solutions, and AI-driven services for sales outreach.

Q: How would you describe WebTose's approach?
A: WebTose focuses on delivering personalized and efficient solutions to meet the unique requirements of its clients.

Q: What is WebTose's focus in the IT domain? 
A: WebTose is committed to revolutionizing how businesses engage with technology.
Q: How large is the team at WebTose? 
A: WebTose has a dynamic team size ranging from 1 to 10 members.
Q: What kind of solutions does WebTose deliver? 
A: WebTose is dedicated to delivering cutting-edge solutions tailored to meet the evolving needs of Softonic Solutions and beyond.
Q: What are WebTose's future plans? 
A: While initially focusing on service-based offerings, WebTose aims to transition towards product-centric solutions in the future.
 
Q: What are the product categories offered by WebTose?
Chatbots: -
1.	Lead Generation Chatbot
2.	PDF Train Chatbot
3.	Appointment Scheduling Chatbots
4.	HR Chatbots
5.	Legal Advisor Chatbots
6.	AI Sales call Agent
7.	AI cold Call Agent 
Website Development: -
1.	E-commerce Website
2.	Blog Website
3.	Shopify
4.	Wix
5.	WordPress 
6.	WebFlow
Q: What is WebTose's Lead Generation Chatbot?
A: WebTose's Lead Generation Chatbot is an AI-driven solution designed to identify and qualify potential leads through intuitive conversations. It empowers sales efforts by streamlining the lead generation process.

Q: How does the PDF Train Chatbot work?
A: The PDF Train Chatbot simplifies document navigation and comprehension by assisting users in understanding complex PDF documents effortlessly. It provides guidance and support to navigate through documents with ease.

Q: What are Appointment Scheduling Chatbots used for?
A: Appointment Scheduling Chatbots offered by WebTose streamline the scheduling process for businesses and clients. They facilitate the management of appointments and bookings, making the process seamless and efficient.

Q: What are the benefits of using HR Chatbots from WebTose?
A: WebTose's HR Chatbots provide instant support for queries related to employee onboarding, policies, and more. They enhance HR operations by offering quick and efficient assistance to employees and HR personnel.

Q: How do Legal Chatbots from WebTose assist with legal matters?
A: Legal Chatbots offered by WebTose facilitate legal processes and inquiries by providing guidance on various legal matters and documentation. They help users navigate through legal complexities with ease.

Q: What platforms does WebTose specialize in for website development?
A: WebTose specializes in website development across multiple platforms, including popular CMS solutions such as Shopify, Wix, and WordPress. They tailor websites to meet the specific needs of their clients.

Q: What are the key features of WebTose's e-commerce website solutions?
A: WebTose's e-commerce website solutions help businesses build a robust online presence. They are tailored to meet the unique requirements of each business, ensuring a seamless and effective e-commerce platform.

Q: How does WebTose's AI Cold Call Agent Service enhance sales outreach?
A: WebTose's AI Cold Call Agent Service represents a paradigm shift in sales outreach strategies. It leverages advanced AI algorithms to optimize the cold calling process, improving efficiency and effectiveness in prospect engagement.

Q: How can WebTose customize its offerings for clients like Softonic Solutions?
A: WebTose welcomes the opportunity to discuss and customize its offerings to align with the unique needs and goals of clients such as Softonic Solutions. They tailor their solutions to meet specific requirements and objectives.
 

What is the team size of WebTose?
WebTose's team size ranges from 1 to 10 members.

In which domain does WebTose operate?
WebTose operates in the IT domain.

What type of services does WebTose offer?
WebTose offers a range of IT services and solutions.

Does WebTose offer product-based solutions?
While currently service-based, WebTose aims to transition towards product-centric solutions in the future.
What is a Lead Generation Chatbot?
A Lead Generation Chatbot is an AI-driven tool for identifying and qualifying potential leads through automated conversations.

What is a PDF Train Chatbot?
A PDF Train Chatbot assists users in navigating and understanding complex PDF documents.

What are Appointment Scheduling Chatbots?
Appointment Scheduling Chatbots streamline the scheduling process for businesses and clients.

How can HR Chatbots benefit businesses?
HR Chatbots provide instant support for HR-related queries and processes.

What is the purpose of Legal Chatbots?
Legal Chatbots offer guidance on legal matters and documentation.

Which website development platforms does WebTose work with?
WebTose specializes in website development on platforms such as Shopify, Wix, and WordPress.

What services are included in e-commerce website solutions?
E-commerce website solutions encompass the development of robust online stores tailored to business needs.

How does the AI Cold Call Agent service work?
The AI Cold Call Agent service optimizes cold calling through AI algorithms for personalized prospect engagement.

What benefits does the AI Cold Call Agent service offer?
The AI Cold Call Agent service enhances efficiency and effectiveness in prospect engagement.

What are the advantages of using chatbots for lead generation?
Chatbots automate lead qualification and improve response times, leading to higher conversion rates.

Can the Lead Generation Chatbot integrate with existing CRM systems?
Yes, the Lead Generation Chatbot can integrate seamlessly with CRM systems for efficient lead management.

How does the PDF Train Chatbot improve document comprehension?
The PDF Train Chatbot provides guided assistance and explanations within PDF documents.

Can Appointment Scheduling Chatbots handle multiple time zones?
Yes, Appointment Scheduling Chatbots can manage appointments across different time zones.

What types of HR queries can be handled by HR Chatbots?
HR Chatbots can address queries related to employee onboarding, policies, benefits, and more.

Are Legal Chatbots capable of providing legal advice?
Legal Chatbots offer guidance and information but should not be considered a substitute for professional legal advice.

What customization options are available for website development?
Website development services include customizable designs, features, and functionalities to suit specific business needs.

Can WebTose develop custom e-commerce solutions?
Yes, WebTose provides custom e-commerce solutions tailored to individual business requirements.

How can businesses benefit from outsourcing website development?
Outsourcing website development allows businesses to access expertise, save time, and focus on core activities.
What factors should businesses consider when choosing a CMS platform?
Considerations include ease of use, scalability, customization options, and compatibility with business goals.

Is Shopify suitable for large-scale e-commerce operations?
Yes, Shopify offers scalability and robust features to support large-scale e-commerce operations.

What are the advantages of using Wix for website development?
Wix offers a user-friendly interface, extensive design options, and convenient hosting solutions.

How does WordPress benefit businesses in terms of website management?
WordPress provides flexibility, a vast library of plugins, and SEO-friendly features for effective website management.

What are the key features of an effective e-commerce website?
Key features include user-friendly navigation, secure payment gateways, product catalogs, and responsive design.

How can businesses optimize their e-commerce websites for search engines?
Strategies include keyword optimization, high-quality content, mobile optimization, and link building.

What are the security measures implemented in WebTose's solutions?
WebTose implements industry-standard security protocols to safeguard data and transactions.

Can WebTose provide maintenance and support for its solutions?
Yes, WebTose offers ongoing maintenance and support services to ensure smooth operation.

What is the turnaround time for website development projects at WebTose?
Turnaround times vary based on project complexity but are typically communicated during project initiation.
Does WebTose offer training for clients to manage their solutions independently?
Yes, WebTose provides training sessions to equip clients with the necessary skills for solution management.

What are the payment options available for WebTose's services?
Payment options include various methods such as bank transfers, credit cards, and online payment gateways.

How does WebTose ensure customer satisfaction with its solutions?
WebTose prioritizes customer feedback and conducts regular reviews to ensure solution quality and satisfaction.

Can WebTose assist with data migration during website development projects?
Yes, WebTose offers data migration services to seamlessly transition existing data to new solutions.

Does WebTose offer consultations for businesses looking to enhance their digital presence?
Yes, WebTose provides consultations to assess business needs and recommend tailored solutions.

What are the steps involved in the development process for WebTose's solutions?
The development process typically involves consultation, planning, design, development, testing, and deployment phases.

What sets WebTose apart from other IT service providers?
WebTose distinguishes itself through its commitment to innovation, quality, and personalized service.

How can businesses measure the effectiveness of AI-driven solutions like chatbots?
Metrics such as conversion rates, response times, and user feedback can help assess the effectiveness of AI-driven solutions.


What are the scalability options for chatbot solutions offered by WebTose?
Chatbot solutions from WebTose are scalable and can be expanded to accommodate growing business needs.

How can businesses ensure compliance with legal regulations when implementing AI solutions?
Working with experienced providers like WebTose, businesses can ensure AI solutions adhere to relevant legal and regulatory requirements.

Can WebTose assist with website redesign projects?
Yes, WebTose offers website redesign services to refresh and optimize existing web properties.

What support channels are available for clients using WebTose's solutions?
Clients can access support via email, phone, or dedicated support portals for prompt assistance.

Does WebTose offer integration services for third-party applications?
Yes, WebTose provides integration services to connect solutions with third-party applications and services.

Can WebTose provide case studies or examples of past projects?
Yes, WebTose can provide case studies showcasing successful implementations and outcomes.

What training resources are available for clients using WebTose's solutions?
WebTose offers comprehensive training materials, tutorials, and documentation for clients' convenience.

Does WebTose offer ongoing updates and improvements to its solutions?
Yes, WebTose continuously updates and enhances its solutions to adapt to evolving technologies and client needs.


What are the key considerations for businesses when choosing an e-commerce platform?
Factors include scalability, customization options, payment gateways, security, and support.

How can businesses ensure data security on their e-commerce websites?
Implementing SSL certificates, regular security audits, and secure payment gateways are crucial for data security.

Can WebTose assist with website hosting and domain registration?
Yes, WebTose offers website hosting and domain registration services for clients' convenience.

What are the advantages of using AI-driven chatbots for customer support?
AI-driven chatbots offer 24/7 availability, instant responses, and personalized assistance, enhancing customer support efficiency.

How does WebTose ensure confidentiality and data privacy in its solutions?
WebTose adheres to strict confidentiality agreements and employs encryption and access controls to safeguard data privacy.

Can WebTose provide multilingual support for its solutions?
Yes, WebTose can implement multilingual support to cater to diverse audience needs.

What steps does WebTose take to ensure accessibility compliance in its solutions?
WebTose designs solutions with accessibility standards in mind, ensuring inclusivity for all users.

How does WebTose approach project management and collaboration with clients?
WebTose follows agile project management methodologies and maintains transparent communication channels with clients throughout the project lifecycle.



Can WebTose assist with digital marketing strategies for e-commerce websites?
Yes, WebTose offers digital marketing services, including SEO, PPC advertising, and social media marketing, to drive traffic and conversions.

What are the payment gateway options supported by WebTose's e-commerce solutions?
WebTose integrates popular payment gateways such as PayPal, Stripe, and Authorize.Net to facilitate secure online transactions.

Does WebTose offer maintenance packages for e-commerce websites post-launch?
Yes, WebTose provides maintenance packages to ensure the ongoing functionality and security of e-commerce websites.

How can businesses leverage chatbots for lead nurturing and customer engagement?
Chatbots can engage prospects with personalized content, provide product recommendations, and facilitate transactions, fostering lead nurturing and customer engagement.

Can WebTose assist with API integrations for e-commerce websites?
Yes, WebTose offers API integration services to connect e-commerce websites with third-party applications and services for enhanced functionality.

What analytics and reporting features are available with WebTose's solutions?
WebTose provides robust analytics and reporting tools to track performance metrics, user behavior, and business insights.

How does WebTose ensure cross-browser compatibility for website development projects?
WebTose rigorously tests websites across multiple browsers and devices to ensure optimal performance and compatibility.

Does WebTose provide scalability options for e-commerce websites to handle increased traffic?
Yes, WebTose designs e-commerce websites with scalability in mind, enabling seamless expansion to accommodate growing traffic and sales volumes.

Can WebTose assist with content creation and management for e-commerce websites?
Yes, WebTose offers content creation and management services, including product descriptions, blog posts, and multimedia content, to enhance engagement and SEO.

How does WebTose ensure user-friendly navigation and intuitive UX/UI design in its solutions?
WebTose follows best practices in UX/UI design, conducting user research and usability testing to create intuitive interfaces and navigation paths.

What security measures does WebTose implement to protect against cyber threats and data breaches?
WebTose employs encryption, firewalls, intrusion detection systems, and regular security audits to mitigate cyber threats and prevent data breaches.

Can WebTose assist with website performance optimization to improve loading speed and responsiveness?
Yes, WebTose optimizes website performance through techniques such as code optimization, image compression, and caching to enhance loading speed and responsiveness.

How can I contact WebTose for inquiries or consultations?
You can reach out to WebTose via email at WebTose3@gmail.com for inquiries, consultations, or any assistance needed.



`


app.post('/webtose', async (req, res) => {
  try {
    let {question}=req.body

    groq.chat.completions.create({

      messages: [
        {
          role: "system",
       

          content: `Please use the provided ${story} to answer the question. 
          If not available, respond based on provided info. Limit response to one line only. If unsure, say 'I don't know'. 
          WebTose Bot suggests narrowing the question within context and asks return questions for communication 
          continuation. Nevere ever say I don't know, try to manage to give relevant answer. If the question is random or unknown, say i am sorry`
        },
        {
          role: "user",
          content: question
        }
      ],
      model: "mixtral-8x7b-32768",

      temperature: 0.9,

      max_tokens: 600,


      stop: null,
      stream: false
    }).then((chatCompletion) => {
      process.stdout.write(chatCompletion.choices[0]?.message?.content || "");
      console.log(chatCompletion.choices[0]?.message?.content);
      let abc = chatCompletion.choices[0]?.message?.content
      res.json({ abc });
    });


  } catch (error) {
    console.error('Error  :', error);
    res.status(500).json({ error: 'Error  ' });
  }
});



////////////////////////////////////////////////////////////////////////////
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, }).then(() => { console.log('Connected Succesfully.') }).catch((err) => console.log('no connection ', err))
const server = app.listen(PORT, () => console.log("Listening on port ", PORT));    