import Hero from '@/components/Hero'
import Portfolio from '@/components/Portfolio'
import InquiryForm from '@/components/InquiryForm'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Portfolio />
      <InquiryForm />
      <Footer />
    </main>
  )
}
