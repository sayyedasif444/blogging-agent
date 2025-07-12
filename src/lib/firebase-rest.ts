// Firebase REST API client to avoid buffer bounds error
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

interface FirestoreDocument {
  name: string;
  fields: Record<string, any>;
  createTime?: string;
  updateTime?: string;
}

interface FirestoreQuery {
  documents: FirestoreDocument[];
}

export const findUserByEmail = async (email: string): Promise<any> => {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/blogtool_auth`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Firestore request failed: ${response.status}`);
    }

    const data: FirestoreQuery = await response.json();
    
    // Find user by email
    const userDoc = data.documents?.find(doc => {
      const fields = doc.fields;
      return fields.email?.stringValue === email.toLowerCase();
    });

    if (!userDoc) {
      return null;
    }

    // Convert Firestore document format to regular object
    const userData: any = {};
    Object.keys(userDoc.fields).forEach(key => {
      const field = userDoc.fields[key];
      if (field.stringValue !== undefined) {
        userData[key] = field.stringValue;
      } else if (field.integerValue !== undefined) {
        userData[key] = parseInt(field.integerValue);
      } else if (field.doubleValue !== undefined) {
        userData[key] = parseFloat(field.doubleValue);
      } else if (field.booleanValue !== undefined) {
        userData[key] = field.booleanValue;
      }
    });

    return {
      id: userDoc.name.split('/').pop(),
      data: () => userData,
      ref: {
        update: async (updates: any) => {
          await updateUserDocument(userDoc.name, updates);
        }
      }
    };

  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

export const updateUserDocument = async (documentPath: string, updates: any) => {
  try {
    const url = `https://firestore.googleapis.com/v1/${documentPath}?updateMask.fieldPaths=credits&updateMask.fieldPaths=lastUpdated`;
    
    // Convert updates to Firestore format
    const firestoreUpdates: any = {};
    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'string') {
        firestoreUpdates[key] = { stringValue: updates[key] };
      } else if (typeof updates[key] === 'number') {
        firestoreUpdates[key] = { integerValue: updates[key].toString() };
      } else if (typeof updates[key] === 'boolean') {
        firestoreUpdates[key] = { booleanValue: updates[key] };
      } else if (updates[key] instanceof Date) {
        firestoreUpdates[key] = { timestampValue: updates[key].toISOString() };
      }
    });

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: firestoreUpdates
      }),
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

export const updateUserCredits = async (userDoc: any, newCredits: number) => {
  await userDoc.ref.update({
    credits: newCredits,
    lastUpdated: new Date()
  });
}; 