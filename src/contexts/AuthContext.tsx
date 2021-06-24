import { createContext, ReactNode, useEffect, useState } from "react";

import { auth, firebase } from "../services/firebase";

type UserType = {
  id: string;
  name: string;
  avatar: string;
};

type AuthContextType = {
  user: UserType | undefined;
  signWithGoogle: () => Promise<void>;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {
  const [user, setUSer] = useState<UserType>();

  useEffect(() => {
    //event listener pra detectar que o usário já havia logado na aplicação
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const { displayName, photoURL, uid } = user;

        if (!displayName || !photoURL) {
          throw new Error("Missing information from Google Account");
        }

        setUSer({
          id: uid,
          name: displayName,
          avatar: photoURL,
        });
      }
    });

    //descadastrar do event listener criado anteriormente (boas práticas)
    return () => {
      unsubscribe();
    };
  }, []);

  async function signWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    const result = await auth.signInWithPopup(provider);

    if (result.user) {
      const { displayName, photoURL, uid } = result.user;

      if (!displayName || !photoURL) {
        throw new Error("Missing information from Google Account");
      }

      setUSer({
        id: uid,
        name: displayName,
        avatar: photoURL,
      });
    }
  }

  return (
    <AuthContext.Provider value={{ user, signWithGoogle }}>
      {props.children}
    </AuthContext.Provider>
  );
}
