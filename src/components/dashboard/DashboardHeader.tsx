import { motion } from "framer-motion";

export const DashboardHeader = () => {
  return (
    <header className="text-center space-y-2">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="px-3 py-1 text-sm bg-success/10 text-success rounded-full">
          Track Your Expenses
        </span>
      </motion.div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Financial Overview
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Keep track of your expenses and income with our beautiful and intuitive
        interface.
      </p>
    </header>
  );
};