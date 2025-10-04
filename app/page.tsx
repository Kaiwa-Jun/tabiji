"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <motion.h1 
        className="text-3xl font-bold underline text-red-500"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Hello world!
      </motion.h1>
      
      <motion.div 
        className="flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button>Click me</Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button variant="secondary">Secondary</Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline">Outline</Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button variant="destructive">Destructive</Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"
        animate={{
          rotate: [0, 360],
          borderRadius: ["20%", "50%", "20%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "loop"
        }}
      />

      <motion.div 
        className="flex gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {[1, 2, 3].map((item, index) => (
          <motion.div
            key={item}
            className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-400 rounded-full"
            animate={{
              y: [0, -30, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
