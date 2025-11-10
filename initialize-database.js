// initialize-database.js
import { db, collection, addDoc } from './firebase-config.js';

async function initializeDatabase() {
  try {
    // Add service categories
    const categories = [
      {
        category_name: "Nail Care Services",
        description: "Premium nail services including manicures, pedicures, and nail enhancements",
        icon: "fas fa-hand-sparkles",
        created_at: new Date()
      },
      {
        category_name: "Hair & Wigs Services", 
        description: "Professional hair styling, wig installation and customization services",
        icon: "fas fa-crown",
        created_at: new Date()
      },
      {
        category_name: "Makeup & Beauty Services",
        description: "Expert makeup application and beauty treatments",
        icon: "fas fa-palette", 
        created_at: new Date()
      }
    ];

    for (const category of categories) {
      await addDoc(collection(db, 'service_categories'), category);
    }

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Uncomment to run initialization
  initializeDatabase();