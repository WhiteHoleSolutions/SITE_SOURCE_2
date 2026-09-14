import Hero from '@/components/Hero'
import Portfolio from '@/components/Portfolio'
import InquiryForm from '@/components/InquiryForm'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Services from '@/components/Services'
import Process from '@/components/Process'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <Portfolio />
      <Process />
      <InquiryForm />
      <Footer />
    </main>
  )
}
