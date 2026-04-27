import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { AppLogo } from '../icons/AppLogo';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginPage.module.css';

type Mode = 'login' | 'register';

export function LoginPage() {
  const { login, register, loading, error, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const switchMode = (m: Mode) => {
    setMode(m);
    clearError();
    setLocalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Preencha todos os campos');
      return;
    }

    if (mode === 'register' && !name) {
      setLocalError('Preencha seu nome');
      return;
    }

    if (password.length < 6) {
      setLocalError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch {
      // error is handled by context
    }
  };

  const displayError = localError || error;

  return (
    <div className={styles.page}>
      {/* Animated background */}
      <div className={styles.bgGlow} />
      <div className={styles.bgGrid} />

      {/* Floating particles */}
      <div className={styles.particles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className={styles.particle}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1400),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 900),
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo + Title */}
        <div className={styles.logoSection}>
          <motion.div
            className={styles.logoCircle}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          >
            <AppLogo size={36} />
          </motion.div>

          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            GestorDash
          </motion.h1>

          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Sparkles size={12} />
            Dashboard Premium de Trafego Pago
          </motion.p>
        </div>

        {/* Mode Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => switchMode('login')}
          >
            {mode === 'login' && (
              <motion.div
                className={styles.tabBg}
                layoutId="activeTab"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={styles.tabText}>Entrar</span>
          </button>
          <button
            className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
            onClick={() => switchMode('register')}
          >
            {mode === 'register' && (
              <motion.div
                className={styles.tabBg}
                layoutId="activeTab"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={styles.tabText}>Criar Conta</span>
          </button>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className={styles.inputGroup}>
                  <User size={16} className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Seu nome"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.inputGroup}>
            <Mail size={16} className={styles.inputIcon} />
            <input
              type="email"
              className={styles.input}
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className={styles.inputGroup}>
            <Lock size={16} className={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              className={styles.input}
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {displayError && (
              <motion.div
                className={styles.error}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                {displayError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className={styles.spinner} />
            ) : (
              <>
                {mode === 'login' ? 'Acessar Dashboard' : 'Criar Conta'}
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.divider}>
            <span>Plataforma Segura</span>
          </div>
          <div className={styles.features}>
            <span>Dados criptografados</span>
            <span className={styles.dot} />
            <span>Acesso 24/7</span>
            <span className={styles.dot} />
            <span>Multi-plataforma</span>
          </div>
        </div>
      </motion.div>

      {/* Copyright */}
      <motion.p
        className={styles.copyright}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        GestorDash &copy; {new Date().getFullYear()}
      </motion.p>
    </div>
  );
}
