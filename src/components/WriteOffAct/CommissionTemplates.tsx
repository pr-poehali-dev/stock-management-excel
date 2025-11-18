import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface CommissionTemplate {
  id: string;
  name: string;
  members: string[];
}

interface CommissionTemplatesProps {
  onApplyTemplate: (members: string[]) => void;
}

export function CommissionTemplates({ onApplyTemplate }: CommissionTemplatesProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<CommissionTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateMembers, setNewTemplateMembers] = useState<string[]>(['', '', '']);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('commissionTemplates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);

  const saveTemplates = (newTemplates: CommissionTemplate[]) => {
    localStorage.setItem('commissionTemplates', JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите название шаблона",
        variant: "destructive"
      });
      return;
    }

    const validMembers = newTemplateMembers.filter(m => m.trim());
    if (validMembers.length === 0) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы одного члена комиссии",
        variant: "destructive"
      });
      return;
    }

    const newTemplate: CommissionTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      members: validMembers
    };

    saveTemplates([...templates, newTemplate]);
    
    toast({
      title: "Шаблон сохранен",
      description: `Шаблон "${newTemplateName}" успешно создан`
    });

    setNewTemplateName('');
    setNewTemplateMembers(['', '', '']);
    setIsDialogOpen(false);
  };

  const handleApplyTemplate = () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (template) {
      onApplyTemplate(template.members);
      toast({
        title: "Шаблон применен",
        description: `Комиссия "${template.name}" загружена`
      });
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (!window.confirm('Удалить этот шаблон?')) return;
    
    const newTemplates = templates.filter(t => t.id !== id);
    saveTemplates(newTemplates);
    
    if (selectedTemplateId === id) {
      setSelectedTemplateId('');
    }
    
    toast({
      title: "Шаблон удален",
      description: "Шаблон комиссии удален"
    });
  };

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Label>Шаблоны комиссий</Label>
        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите шаблон" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} ({template.members.length} чел.)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="outline" 
        onClick={handleApplyTemplate}
        disabled={!selectedTemplateId}
      >
        <Icon name="Download" size={16} className="mr-2" />
        Применить
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить шаблон
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Создать шаблон комиссии</DialogTitle>
            <DialogDescription>Сохранение состава комиссии для быстрого использования</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Название шаблона</Label>
              <Input 
                placeholder="Основная комиссия"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Члены комиссии</Label>
              <div className="space-y-2 mt-2">
                {newTemplateMembers.map((member, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input 
                      placeholder={`ФИО члена комиссии ${idx + 1}`}
                      value={member}
                      onChange={(e) => {
                        const newMembers = [...newTemplateMembers];
                        newMembers[idx] = e.target.value;
                        setNewTemplateMembers(newMembers);
                      }}
                    />
                    {newTemplateMembers.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setNewTemplateMembers(newTemplateMembers.filter((_, i) => i !== idx));
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setNewTemplateMembers([...newTemplateMembers, ''])}
                  className="gap-2 w-full"
                >
                  <Icon name="Plus" size={16} />
                  Добавить члена
                </Button>
              </div>
            </div>

            {templates.length > 0 && (
              <div>
                <Label>Сохраненные шаблоны</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{template.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-destructive hover:text-destructive h-8 w-8"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveTemplate}>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}