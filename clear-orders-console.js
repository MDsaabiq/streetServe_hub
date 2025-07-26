// ========================================
// CLEAR ALL ORDERS - BROWSER CONSOLE SCRIPT
// ========================================
// 
// INSTRUCTIONS:
// 1. Open your StreetServe Hub app in the browser
// 2. Open Developer Tools (F12)
// 3. Go to the Console tab
// 4. Copy and paste this entire script
// 5. Press Enter to execute
//
// ⚠️ WARNING: This will permanently delete ALL orders!
// ========================================

(async function clearAllOrders() {
  console.log('🚀 StreetServe Hub - Order Cleanup Script');
  console.log('========================================');
  
  try {
    // Check if we're on the right page
    if (!window.location.href.includes('localhost') && !window.location.href.includes('streetserve')) {
      console.error('❌ Please run this script on your StreetServe Hub app page');
      return;
    }
    
    // Try to access Firebase from the global scope
    let db, collection, getDocs, deleteDoc, doc, writeBatch;
    
    // Method 1: Try to get from window object
    if (window.firebase) {
      console.log('📦 Found Firebase on window object');
      db = window.firebase.db;
      collection = window.firebase.collection;
      getDocs = window.firebase.getDocs;
      deleteDoc = window.firebase.deleteDoc;
      doc = window.firebase.doc;
      writeBatch = window.firebase.writeBatch;
    }
    
    // Method 2: Try to import from modules (if available)
    if (!db) {
      try {
        const firebaseModule = await import('/src/lib/firebase.js');
        db = firebaseModule.db;
        const firestoreModule = await import('firebase/firestore');
        collection = firestoreModule.collection;
        getDocs = firestoreModule.getDocs;
        deleteDoc = firestoreModule.deleteDoc;
        doc = firestoreModule.doc;
        writeBatch = firestoreModule.writeBatch;
        console.log('📦 Imported Firebase modules');
      } catch (e) {
        console.log('⚠️ Could not import Firebase modules');
      }
    }
    
    if (!db) {
      console.error('❌ Firebase database not accessible');
      console.log('💡 Alternative: Use the Admin page at /admin');
      console.log('💡 Or manually delete orders from Firebase Console');
      return;
    }
    
    console.log('🔍 Checking for orders...');
    
    // Get all orders
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    
    console.log(`📊 Found ${snapshot.size} orders in database`);
    
    if (snapshot.size === 0) {
      console.log('✅ No orders found. Database is already clean!');
      return;
    }
    
    // Confirm deletion
    const confirmed = confirm(
      `⚠️ WARNING: You are about to delete ${snapshot.size} orders!\n\n` +
      'This action cannot be undone.\n\n' +
      'Orders to be deleted:\n' +
      '• All buyer orders\n' +
      '• All vendor orders\n' +
      '• Order history and status\n\n' +
      'Click OK to proceed or Cancel to abort.'
    );
    
    if (!confirmed) {
      console.log('❌ Operation cancelled by user');
      return;
    }
    
    console.log('🗑️ Starting deletion process...');
    
    // Use batch delete for better performance
    const batch = writeBatch(db);
    let deleteCount = 0;
    
    snapshot.forEach((orderDoc) => {
      batch.delete(doc(db, 'orders', orderDoc.id));
      deleteCount++;
    });
    
    console.log(`📝 Prepared ${deleteCount} orders for deletion`);
    
    // Execute batch delete
    await batch.commit();
    
    console.log('✅ SUCCESS! All orders have been deleted');
    console.log('========================================');
    console.log('📊 Summary:');
    console.log(`   • Orders deleted: ${deleteCount}`);
    console.log('   • Database: Clean');
    console.log('   • Status: Complete');
    console.log('========================================');
    console.log('🔄 Refresh your Orders and Vendor Orders pages to see changes');
    
    // Show success alert
    alert(`✅ Success!\n\n${deleteCount} orders have been deleted.\n\nRefresh your pages to see the changes.`);
    
  } catch (error) {
    console.error('❌ Error during deletion:', error);
    console.log('========================================');
    console.log('🛠️ Troubleshooting:');
    console.log('1. Make sure you are logged into the app');
    console.log('2. Try using the Admin page at /admin');
    console.log('3. Check Firebase Console manually');
    console.log('4. Ensure you have proper permissions');
    
    alert('❌ Error occurred during deletion.\nCheck the console for details.');
  }
})();

// ========================================
// END OF SCRIPT
// ========================================
