import { motion } from 'framer-motion';
import { Layers3, Github, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      className="sticky top-0 z-50 w-full backdrop-blur-xl bg-gradient-glass border-b border-border/40"
      style={{ boxShadow: 'var(--shadow-glass)' }}
    >
      <div className="absolute inset-0 bg-gradient-glow opacity-50 pointer-events-none" />
      <div className="container mx-auto px-6 h-20 flex items-center justify-between relative">
        <motion.div 
          className="flex items-center gap-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-primary shadow-glow relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Layers3 className="w-7 h-7 text-primary-foreground relative z-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Image Similarity Analyzer
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              AI-powered comparison & deep learning analysis
            </p>
          </div>
        </motion.div>

        <motion.nav 
          className="hidden md:flex items-center gap-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 transition-colors">
            <a href="#demo" className="gap-2">
              <FileText className="w-4 h-4" />
              Demo
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 transition-colors">
            <a href="#how-it-works" className="gap-2">
              <BookOpen className="w-4 h-4" />
              How it works
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 transition-colors">
            <a href="https://docs.lovable.dev" target="_blank" rel="noopener noreferrer" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Docs
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 transition-colors">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="gap-2">
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </Button>
        </motion.nav>

        <div className="flex md:hidden">
          <Button variant="ghost" size="sm">
            Menu
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
