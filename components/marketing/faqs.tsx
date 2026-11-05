"use client"

import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQs() {
  const faqItems = [
    {
      id: "item-1",
      question: "What is Avenro?",
      answer:
        "Avenro is a project tool for small software teams, university groups and early-stage startups. It combines backlog, boards, sprints, meetings, decisions and documents. Avenro is in early development.",
    },
    {
      id: "item-2",
      question: "How much does it cost?",
      answer:
        "$8 per active member per month or $80 per year, 30-day free trial, card required, cancel anytime. Cancel before the trial ends and you pay nothing. Viewers and clients are free. See pricing for details.",
    },
    {
      id: "item-3",
      question: "Where is my data stored and who processes it?",
      answer:
        "Your data is stored with Supabase. Payments run through Stripe. The full list of subprocessors is on the subprocessors page.",
    },
    {
      id: "item-4",
      question: "How do I delete my account?",
      answer:
        "You can delete your account from your privacy settings. Deletion is one step and removes your personal data. The privacy page explains what is kept and for how long.",
    },
    {
      id: "item-5",
      question: "Who can use Avenro?",
      answer:
        "You must be at least 16 years old to create an account. We do not collect data from children under 16.",
    },
  ]

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div>
          <h2 className="text-4xl font-semibold text-foreground">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-balance text-muted-foreground">
            Short answers to the questions we hear most.
          </p>
        </div>

        <div className="mt-12">
          <Accordion
            type="single"
            collapsible
            className="w-full rounded-(--radius) border border-transparent bg-card px-8 py-3 shadow ring-1 ring-foreground/5"
          >
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-dotted"
              >
                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-base">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-6 text-muted-foreground">
            Still have a question? Contact us at{" "}
            <Link
              href="/contact"
              className="font-medium text-primary hover:underline"
            >
              the contact page
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
