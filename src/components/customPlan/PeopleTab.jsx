import React from 'react';
import { User } from 'lucide-react';

const PEOPLE_OPTIONS = [
  { id: 'Abraham', name: 'Abraham', description: 'Father of faith' },
  { id: 'Job', name: 'Job', description: 'Patience through suffering' },
  { id: 'Joseph', name: 'Joseph', description: 'From pit to palace' },
  { id: 'Moses', name: 'Moses', description: 'Deliverer and lawgiver' },
  { id: 'Joshua', name: 'Joshua', description: 'Conqueror and leader' },
  { id: 'David', name: 'David', description: 'Man after God\'s heart' },
  { id: 'Elijah', name: 'Elijah', description: 'Prophet of fire' },
  { id: 'Daniel', name: 'Daniel', description: 'Faithful in exile' },
  { id: 'Peter', name: 'Peter', description: 'Rock of the church' },
  { id: 'Paul', name: 'Paul', description: 'Apostle to the Gentiles' },
];

export default function PeopleTab({ selectedPerson, onPersonChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PEOPLE_OPTIONS.map((person) => {
        const isSelected = selectedPerson === person.id;
        
        return (
          <button
            key={person.id}
            onClick={() => onPersonChange(person.id)}
            className={`text-left p-4 rounded-xl border transition-all ${
              isSelected
                ? 'border-foreground bg-accent'
                : 'border-border bg-card hover:bg-accent/50'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{person.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{person.description}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}